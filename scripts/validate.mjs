#!/usr/bin/env node
/* Static validation for the no-build site. Run before deploying:
   node scripts/validate.mjs
   It checks that every local asset referenced by the HTML/CSS/JS exists,
   that the CSP hash matches the JSON-LD block, and that required SEO files
   are present. No dependencies. */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const errors = [];
const warnings = [];

const read = (file) => readFileSync(resolve(root, file), 'utf8');
const exists = (file) => existsSync(resolve(root, file));
const fail = (msg) => errors.push(msg);

const required = [
  'index.html', '404.html', 'robots.txt', 'sitemap.xml', 'site.webmanifest', '.nojekyll',
  'css/fonts.css', 'css/viscous.css', 'css/site.css',
  'js/site/app.js', 'js/site/config.js', 'js/site/theme.js',
  'js/viscous/index.js', 'js/viscous/core.js',
  'vendor/react.production.min.js', 'vendor/react-dom.production.min.js', 'vendor/htm.umd.js',
  'assets/og.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
  'LICENSE',
];
required.forEach((f) => { if (!exists(f)) fail(`missing required file: ${f}`); });

const html = exists('index.html') ? read('index.html') : '';

function checkLocalRef(ref, file, kind) {
  if (!ref) return;
  const clean = ref.split('#')[0].split('?')[0].trim();
  if (!clean || /^(https?:|data:|mailto:|tel:|javascript:|\/\/)/.test(clean)) return;
  if (clean.startsWith('/')) {
    // project-site absolute paths are only used by 404.html
    if (file !== '404.html') fail(`${file}: root-relative ${kind} "${ref}" breaks under a project Pages path`);
    return;
  }
  const target = resolve(dirname(resolve(root, file)), clean);
  if (!existsSync(target) || !statSync(target).isFile()) {
    fail(`${file}: ${kind} does not exist: ${ref}`);
  }
}

// 1. HTML references
for (const m of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const ref = m[1];
  if (ref.startsWith('#')) continue;
  checkLocalRef(ref, 'index.html', 'asset');
}
if (/<script[^>]+src="https?:/.test(html)) fail('index.html loads a script from a third-party origin');
if (/<link[^>]+rel="stylesheet"[^>]+href="https?:/.test(html)) fail('index.html loads a stylesheet from a third-party origin');

// 2. CSS url() references
for (const file of ['css/fonts.css', 'css/viscous.css', 'css/site.css']) {
  if (!exists(file)) continue;
  const css = read(file);
  for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]+))\s*\)/g)) {
    checkLocalRef(m[1] || m[2] || m[3], file, 'url()');
  }
}

// 3. JS import graph. Strip template literals and comments first so code
// samples inside strings are not mistaken for real imports.
const stripTemplates = (src) => {
  let out = '', inTemplate = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (!inTemplate) {
      if (ch === '`') { inTemplate = true; out += '`'; }
      else out += ch;
    } else if (ch === '\\') {
      i++;
    } else if (ch === '`') {
      inTemplate = false;
      out += '`';
    }
  }
  return out;
};
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const jsFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(resolve(root, dir))) {
    const rel = join(dir, entry).replaceAll('\\', '/');
    if (exists(rel) && statSync(resolve(root, rel)).isDirectory()) walk(rel);
    else if (rel.endsWith('.js')) jsFiles.push(rel);
  }
};
['js'].forEach(walk);
for (const file of jsFiles) {
  const js = stripComments(stripTemplates(read(file)));
  const specs = [
    ...js.matchAll(/^\s*(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/gm),
    ...js.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm),
  ].map((m) => m[1]);
  for (const spec of specs) {
    if (!spec.startsWith('.')) continue;
    const target = resolve(dirname(resolve(root, file)), spec);
    if (!existsSync(target)) fail(`${file}: import does not exist: ${spec}`);
  }
}

// 4. JSON-LD + CSP hash
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ld) fail('index.html: missing JSON-LD block');
else {
  try { JSON.parse(ld[1]); } catch (e) { fail(`index.html: invalid JSON-LD (${e.message})`); }
  const hash = createHash('sha256').update(ld[1], 'utf8').digest('base64');
  const csp = html.match(/script-src[^;"]*'sha256-([^']+)'/);
  if (!csp) fail('index.html: CSP is missing the JSON-LD sha256 hash');
  else if (csp[1] !== hash) fail('index.html: CSP hash does not match the JSON-LD block');
}

// 5. SEO essentials
const checks = [
  [/<title>[^<]{10,}<\/title>/, 'title'],
  [/<meta name="description" content="[^"]{50,}"/, 'meta description'],
  [/<link rel="canonical" href="https:\/\/[^"]+"/, 'canonical URL'],
  [/<meta property="og:image" content="https:\/\/[^"]+"/, 'og:image'],
  [/<meta name="twitter:card" content="summary_large_image"/, 'twitter card'],
  [/<html lang="en"/, 'html lang'],
  [/<meta name="viewport" content="width=device-width, initial-scale=1"/, 'viewport'],
];
checks.forEach(([re, name]) => { if (!re.test(html)) fail(`index.html: missing ${name}`); });

// 6. Data files
for (const file of ['site.webmanifest']) {
  if (!exists(file)) continue;
  try { JSON.parse(read(file)); } catch (e) { fail(`${file}: invalid JSON (${e.message})`); }
}
if (exists('sitemap.xml') && !/<urlset[\s\S]*<loc>https:\/\//.test(read('sitemap.xml'))) {
  fail('sitemap.xml: no absolute <loc> URL');
}

// 7. Warnings for placeholder / stale content
const stale = [
  ['https://github.com/"', 'placeholder GitHub link'],
  ['viscous-ui.dev', 'stale demo domain'],
  ['12.4k', 'fake star count'],
  ['npm i viscous-ui', 'taken npm package name'],
];
for (const [needle, label] of stale) {
  if (html.includes(needle)) fail(`index.html: ${label} still present (${needle})`);
  for (const file of jsFiles) {
    if (read(file).includes(needle)) fail(`${file}: ${label} still present (${needle})`);
  }
}

if (warnings.length) warnings.forEach((w) => console.warn('warning:', w));
if (errors.length) {
  errors.forEach((e) => console.error('error:', e));
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log(`OK — ${jsFiles.length} JS modules, all local references resolve.`);
