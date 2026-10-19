/* Landing — page sections */
import { html, useState, useRef, useEffect, useMemo, cx, Icon, GooeyFilter } from '../viscous/core.js';
import {
  GooeyNav, GooeyTabs, GooeyButton, GooeySwitch, GooeySlider, GooeyAccordion, GooeyCursor,
  GooeyAvatarGroup, GooeyLoader, VERSION, useToast,
} from '../viscous/index.js';
import { DEMOS, CATEGORIES } from './demos.js';
import { CodeBlock, CopyButton, SectionHead, Logo, useCopy, useInView } from './shared.js';
import { GITHUB_URL, PACKAGE_NAME, LICENSE_URL } from './config.js';

/* Source-first install while the npm package is being prepared. */
const INSTALL = 'git clone https://github.com/0dvsh0/viscous-ui.git';

/* =========================================================================
   Header
   ========================================================================= */
function MobileNav({ links, section }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const first = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      const btn = root.current && root.current.querySelector('button');
      btn && btn.focus();
    };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => { if (open && first.current) first.current.focus(); }, [open]);

  return html`<div className="site-mobile-nav" ref=${root}>
    <button
      type="button"
      className="site-mobile-nav__btn"
      aria-expanded=${open}
      aria-controls="site-mobile-menu"
      aria-label=${open ? 'Close menu' : 'Open menu'}
      onClick=${() => setOpen(!open)}
    >
      <${Icon} name=${open ? 'x' : 'menu'} size=${18} />
    </button>
    <nav id="site-mobile-menu" className="site-mobile-nav__panel" aria-label="Mobile" hidden=${!open}>
      <ul>
        ${links.map((l) => html`<li key=${l.value}>
          <a
            ref=${l.value === links[0].value ? first : undefined}
            href=${l.href}
            aria-current=${l.value === section ? 'page' : undefined}
            onClick=${(e) => { setOpen(false); l.onClick(e); }}
          >${l.icon && html`<${Icon} name=${l.icon} size=${16} />`}<span>${l.label}</span></a>
        </li>`)}
      </ul>
    </nav>
  </div>`;
}

export function SiteHeader({ theme, setTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState('components');
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  // scroll-spy keeps the liquid indicator in sync with the section in view
  useEffect(() => {
    const ids = ['components', 'anatomy', 'install', 'faq'];
    const io = new IntersectionObserver((en) => {
      en.forEach((e) => { if (e.isIntersecting) setSection(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, []);
  const go = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const links = [
    { value: 'components', label: 'Components', href: '#components', icon: 'grid', onClick: go('components') },
    { value: 'anatomy', label: 'Anatomy', href: '#anatomy', icon: 'layers', onClick: go('anatomy') },
    { value: 'install', label: 'Install', href: '#install', icon: 'terminal', onClick: go('install') },
    { value: 'faq', label: 'FAQ', href: '#faq', icon: 'sparkle', onClick: go('faq') },
  ];
  return html`
    <header className=${cx('site-header', scrolled && 'is-scrolled')} id="site-header">
      <div className="site-container site-header__inner">
        <a href="#top" className="site-brand" onClick=${go('top')}>
          <${Logo} />
          <span>Viscous<em>/ui</em></span>
          <span className="site-version">v${VERSION}</span>
        </a>
        <div className="site-header__nav"><${GooeyNav} size="sm" items=${links.map(({ value, label, href, onClick }) => ({ value, label, href, onClick }))} value=${section} onChange=${setSection} label="Primary" /></div>
        <div className="site-header__actions">
          <${GooeySwitch}
            size="sm"
            hideLabel
            label="Light theme"
            checked=${theme === 'light'}
            onChange=${(v) => setTheme(v ? 'light' : 'dark')}
            iconOn="sun"
            iconOff="moon"
          />
          <a className="site-gh" href=${GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Star Viscous UI on GitHub">
            <${Icon} name="github" size=${16} />
            <span className="site-gh__label">Star</span>
          </a>
          <${MobileNav} links=${links} section=${section} />
        </div>
      </div>
    </header>`;
}

/* =========================================================================
   Hero
   ========================================================================= */
function HeroBlobs() {
  return html`<div className="hero-blobs vx-goo vx-goo--l" aria-hidden="true">
    <span className="hero-blob hero-blob--a" />
    <span className="hero-blob hero-blob--b" />
    <span className="hero-blob hero-blob--c" />
    <span className="hero-blob hero-blob--d" />
  </div>`;
}

function InstallPill() {
  const [copied, copy] = useCopy();
  return html`<button type="button" className=${cx('hero-install', copied && 'is-copied')} onClick=${() => copy(INSTALL)} aria-label=${INSTALL + ' — copy install command'}>
    <span className="hero-install__prompt">$</span>
    <code>${INSTALL}</code>
    <span className="hero-install__icon"><${Icon} name=${copied ? 'check' : 'copy'} size=${14} /></span>
  </button>`;
}

function HeroStage() {
  const [vis, setVis] = useState(68);
  const [on, setOn] = useState(true);
  const toast = useToast();
  return html`<div className="hero-stage" data-reveal>
    <div className="hero-stage__chrome">
      <span className="site-code__dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="hero-stage__url">viscous-ui / playground</span>
      <span />
    </div>
    <div className="hero-stage__grid">
      <div className="hero-stage__panel hero-stage__panel--main">
        <${GooeyTabs} items=${[{ label: 'Overview' }, { label: 'Motion' }, { label: 'Tokens' }]} defaultValue="Motion" label="Stage tabs" />
        <div className="hero-stage__metric">
          <span className="hero-stage__label">Surface tension</span>
          <strong>${vis}<small>%</small></strong>
        </div>
        <${GooeySlider} label="Tension" value=${vis} onChange=${setVis} showValue=${false} />
        <div className="hero-stage__row">
          <${GooeyButton} size="sm" iconRight="arrowRight" onClick=${() => toast('Settings applied', { description: 'Tension set to ' + vis + '%', icon: 'droplet' })}>Apply<//>
          <${GooeyButton} size="sm" variant="ghost" onClick=${() => setVis(68)}>Reset<//>
        </div>
      </div>
      <div className="hero-stage__panel hero-stage__panel--side">
        <div className="hero-stage__toggle"><span>Live motion</span><${GooeySwitch} hideLabel label="Live motion" checked=${on} onChange=${setOn} /></div>
        <div className="hero-stage__toggle"><span>Haptics</span><${GooeySwitch} hideLabel label="Haptics" /></div>
        <div className="hero-stage__loader">${on ? html`<${GooeyLoader} variant="morph" />` : html`<span className="hero-stage__paused">Paused</span>`}</div>
        <${GooeyAvatarGroup} size=${32} max=${3} people=${[{ name: 'Ada L' }, { name: 'Max V' }, { name: 'Ian T' }, { name: 'Mo S' }, { name: 'Lu K' }]} />
      </div>
    </div>
  </div>`;
}

export function Hero() {
  const ref = useRef(null);
  return html`
    <section className="hero" id="top" ref=${ref} aria-labelledby="hero-title">
      <${GooeyCursor} targetRef=${ref} />
      <${HeroBlobs} />
      <div className="site-container hero__inner">
        <a className="hero-chip" href="#components">
          <span className="hero-chip__dot" />
          <span>v${VERSION} · ${DEMOS.length} components · open source</span>
          <${Icon} name="arrowRight" size=${14} />
        </a>
        <h1 className="hero__title" id="hero-title">
          <span className="hero__line">Interfaces that</span>
          <span className="hero__line"><span className="hero__flow">flow</span> like ink.</span>
        </h1>
        <p className="hero__lede">
          Viscous is an open-source React library of gooey, physically-inspired components:
          navbars, cards, sliders, dialogs and more. It's built on one SVG filter and native semantics, in mono carbon.
        </p>
        <div className="hero__ctas">
          <${GooeyButton} size="lg" href="#components" iconRight="arrowRight">Browse components<//>
          <${InstallPill} />
        </div>
        <ul className="hero__meta" aria-label="Library facts">
          <li><strong>${DEMOS.length}</strong><span>production components</span></li>
          <li><strong>WAI-ARIA</strong><span>keyboard & screen reader</span></li>
          <li><strong>MIT</strong><span>free forever</span></li>
        </ul>
      </div>
      <div className="site-container"><${HeroStage} /></div>
    </section>`;
}

/* =========================================================================
   Marquee of component names
   ========================================================================= */
export function Marquee() {
  const names = DEMOS.map((d) => d.component);
  const row = (k) => names.map((n) => html`<span key=${k + n} className="marquee__item"><i aria-hidden="true" />${n}</span>`);
  return html`<div className="marquee" aria-hidden="true">
    <div className="marquee__track">${row('a')}${row('b')}</div>
  </div>`;
}

/* =========================================================================
   Components gallery
   ========================================================================= */
function DemoTile({ d }) {
  const [mode, setMode] = useState('preview');
  const [stageRef, inView] = useInView('500px 0px');
  return html`<article className=${cx('tile', d.span === 2 && 'is-wide', d.tall && 'is-tall')} id=${'c-' + d.id} data-reveal>
    <header className="tile__head">
      <div>
        <h3 className="tile__name">${d.name}</h3>
        <code className="tile__cmp">${'<' + d.component + ' />'}</code>
      </div>
      <${GooeyTabs} size="sm" label=${d.name + ' view'} value=${mode} onChange=${setMode} items=${[{ value: 'preview', label: 'Preview' }, { value: 'code', label: 'Code' }]} />
    </header>
    <div className="tile__stage" ref=${stageRef}>
      ${mode === 'preview'
        ? (inView
          ? html`<div className="tile__demo"><${d.Demo} /></div>`
          : html`<div className="tile__placeholder" aria-hidden="true"><${GooeyLoader} variant="morph" size="sm" label="" /></div>`)
        : html`<${CodeBlock} code=${d.code} className="tile__code" />`}
    </div>
  </article>`;
}

export function Gallery() {
  const [cat, setCat] = useState('All');
  const list = useMemo(() => (cat === 'All' ? DEMOS : DEMOS.filter((d) => d.cat === cat)), [cat]);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c, c === 'All' ? DEMOS.length : DEMOS.filter((d) => d.cat === c).length])), []);
  return html`<section className="site-section" id="components" aria-labelledby="components-title">
    <div className="site-container">
      <div className="gallery__top">
        <${SectionHead}
          index="01"
          eyebrow="Components"
          title=${html`<span id="components-title">The backbone of every app,<br />now with surface tension.</span>`}
          lede="Every component you ship, running live. Hover, drag, click and tab through them, or switch to Code to see the API."
        />
        <div className="gallery__filter" data-reveal>
          <${GooeyTabs}
            label="Filter components"
            value=${cat}
            onChange=${setCat}
            items=${CATEGORIES.map((c) => ({ value: c, label: html`${c}<sup>${counts[c]}</sup>` }))}
          />
        </div>
      </div>
      <div className="gallery" key=${cat}>
        ${list.map((d) => html`<${DemoTile} key=${d.id} d=${d} />`)}
      </div>
    </div>
  </section>`;
}

/* =========================================================================
   Anatomy — interactive filter playground
   ========================================================================= */
export function Anatomy() {
  const [blur, setBlur] = useState(12);
  const [alpha, setAlpha] = useState(24);
  const [shift, setShift] = useState(-10);
  const [raw, setRaw] = useState(false);
  const svg = `<filter id="goo">\n  <feGaussianBlur stdDeviation="${blur}" />\n  <feColorMatrix values="\n    1 0 0 0 0\n    0 1 0 0 0\n    0 0 1 0 0\n    0 0 0 ${alpha} ${shift}" />\n</filter>`;
  return html`<section className="site-section anatomy" id="anatomy" aria-labelledby="anatomy-title">
    <svg className="vx-defs" aria-hidden="true"><defs><${GooeyFilter} id="pg-goo" blur=${blur} alpha=${alpha} shift=${shift} /></defs></svg>
    <div className="site-container">
      <${SectionHead}
        index="02"
        eyebrow="Anatomy"
        title=${html`<span id="anatomy-title">Two filter primitives.<br />Infinite liquid.</span>`}
        lede="Blur makes shapes bleed into each other, and a steep alpha curve pulls that bleed back into a crisp edge. Labels sit on a separate layer with no filter, so text stays sharp."
      />
      <div className="anatomy__grid">
        <div className="anatomy__lab" data-reveal>
          <div className="anatomy__canvas" style=${{ filter: raw ? 'none' : 'url(#pg-goo)' }} aria-hidden="true">
            <span className="lab-blob lab-blob--1" />
            <span className="lab-blob lab-blob--2" />
            <span className="lab-blob lab-blob--3" />
            <span className="lab-blob lab-blob--4" />
          </div>
          <div className="anatomy__legend">
            <span>${raw ? 'Raw shapes, filter off' : 'Filter on, shapes fuse'}</span>
            <${GooeySwitch} label="Show raw" size="sm" checked=${raw} onChange=${setRaw} />
          </div>
        </div>
        <div className="anatomy__controls" data-reveal>
          <${GooeySlider} label="Blur · stdDeviation" min=${2} max=${24} value=${blur} onChange=${setBlur} />
          <${GooeySlider} label="Alpha multiplier" min=${4} max=${40} value=${alpha} onChange=${setAlpha} />
          <${GooeySlider} label="Alpha offset" min=${-24} max=${-2} value=${shift} onChange=${setShift} />
          <${CodeBlock} filename="goo.svg" code=${svg} />
        </div>
      </div>
      <ol className="layers" data-reveal>
        ${[
          ['01', 'Goo layer', 'Plain shapes with the filter applied: indicators, drops, bridges. Never text.'],
          ['02', 'Content layer', 'Labels and icons with no filter, recoloured to contrast with the ink.'],
          ['03', 'Hit layer', 'Native buttons, inputs and roles, which are what assistive tech reads.'],
        ].map(([n, t, d]) => html`<li key=${n} className="layer">
          <span className="layer__n">${n}</span>
          <strong>${t}</strong>
          <p>${d}</p>
        </li>`)}
      </ol>
    </div>
  </section>`;
}

/* =========================================================================
   Principles
   ========================================================================= */
export function Principles() {
  const items = [
    ['accessibility', 'Accessible by construction', 'Real buttons and inputs, roving focus and aria-* states. The goo is only decoration, never the interface.'],
    ['feather', 'Feather-weight', 'No animation runtime. Motion is done with CSS transitions on transforms, which the GPU composites.'],
    ['palette', 'Token themed', 'Mono carbon out of the box. Change a dozen CSS variables, or scope .vx-theme-light to any subtree.'],
    ['sliders', 'Controlled or not', 'Every stateful component accepts value / defaultValue / onChange, so it works with any form library.'],
    ['eye', 'Reduced-motion aware', 'Respects prefers-reduced-motion and replaces liquid choreography with short, calm fades.'],
    ['package', 'Tree-shakeable ESM', 'Import only what you use: five modules, one stylesheet and one <GooeyDefs /> at the root.'],
  ];
  return html`<section className="site-section" id="principles" aria-labelledby="principles-title">
    <div className="site-container">
      <${SectionHead} index="03" eyebrow="Principles" title=${html`<span id="principles-title">Playful on the surface.<br />Serious underneath.</span>`} />
      <ul className="principles">
        ${items.map(([ic, t, d]) => html`<li key=${t} className="principle" data-reveal>
          <span className="principle__icon"><${Icon} name=${ic} size=${20} /></span>
          <h3>${t}</h3>
          <p>${d}</p>
        </li>`)}
      </ul>
    </div>
  </section>`;
}

/* =========================================================================
   Install / quick start
   ========================================================================= */
const HTML_SNIPPET = `<script src="./vendor/react.production.min.js"></script>
<script src="./vendor/react-dom.production.min.js"></script>
<script src="./vendor/htm.umd.js"></script>
<script type="module" src="./app.js"></script>`;
const USAGE = `import './css/viscous.css';
import { html } from './js/viscous/core.js';
import { GooeyDefs, GooeyNav, GooeyButton } from './js/viscous/index.js';

export default function App() {
  return html\`
    <\${GooeyDefs} />
    <\${GooeyNav} items=\${[{ label: 'Home' }, { label: 'Docs' }]} />
    <\${GooeyButton} iconRight="arrowRight">Get started<//>
  \`;
}`;
const THEME = `.my-brand {
  --vx-ink: #f4f4f4;     /* liquid colour */
  --vx-ink-fg: #0a0a0a;  /* text on liquid */
  --vx-surface-2: #161616;
  --vx-ease: cubic-bezier(.65, 0, .35, 1);
}`;

export function Install() {
  return html`<section className="site-section" id="install" aria-labelledby="install-title">
    <div className="site-container install">
      <div className="install__copy">
        <${SectionHead}
          index="04"
          eyebrow="Quick start"
          title=${html`<span id="install-title">Pour it into<br />your app in a minute.</span>`}
          lede="The source is on GitHub today: copy the stylesheet and the five component modules, then mount the filter defs once. No build step required."
        />
        <ol className="install__steps" data-reveal>
          <li><span>1</span>Clone the repository</li>
          <li><span>2</span>Copy <code>css/</code> and <code>js/</code></li>
          <li><span>3</span>Mount <code>${'<GooeyDefs />'}</code> once</li>
          <li><span>4</span>Compose components</li>
        </ol>
        <p className="install__note" data-reveal>
          <span className="install__tag">npm</span>
          Publishing as <code>${PACKAGE_NAME}</code> is in progress.
          <a href=${GITHUB_URL} target="_blank" rel="noopener noreferrer">Watch the repository</a> for the release.
        </p>
      </div>
      <div className="install__code" data-reveal>
        <div className="install__cmd">
          <span className="hero-install__prompt">$</span>
          <code>${INSTALL}</code>
          <${CopyButton} text=${INSTALL} label="Copy clone command" />
        </div>
        <${CodeBlock} filename="index.html" code=${HTML_SNIPPET} />
        <${CodeBlock} filename="App.js" code=${USAGE} />
        <${CodeBlock} filename="theme.css" code=${THEME} />
      </div>
    </div>
  </section>`;
}

/* =========================================================================
   FAQ
   ========================================================================= */
export function Faq() {
  return html`<section className="site-section" id="faq" aria-labelledby="faq-title">
    <div className="site-container faq">
      <${SectionHead} index="05" eyebrow="FAQ" title=${html`<span id="faq-title">Questions,<br />answered.</span>`} />
      <div data-reveal>
        <${GooeyAccordion} defaultOpen=${[0]} items=${[
          { title: 'How does the gooey effect work?', content: 'An SVG filter blurs a layer of plain shapes. A colour matrix then multiplies the alpha channel and subtracts an offset. Where blurs overlap they cross the threshold together, so separate shapes look like one fluid mass.' },
          { title: 'Why doesn’t the text get blurry?', content: 'Viscous never filters content. Each component has three layers: filtered shapes, sharp content on top, and a native element for interaction. That gives you liquid motion without blurring the type.' },
          { title: 'Is it fast enough for production?', content: 'Shapes animate with transform only, and each filter region is limited to its own component. The target is 60fps on mid-range Android. For long lists, use the Tabs or Nav indicators instead of per-row effects.' },
          { title: 'Which browsers are supported?', content: 'Current Chrome, Edge and Firefox, and Safari 16+. Older engines still move the shapes; they just don’t fuse.' },
          { title: 'Can I use it with Next.js / Remix / Vite?', content: 'Yes. Components are plain React. The only context you need is GooeyToaster, and only for toasts. In the App Router, mark interactive components as client components.' },
          { title: 'Is it really free?', content: 'Yes, it’s MIT licensed. Use it in commercial work, fork it, remix it. A star on GitHub is always appreciated.' },
        ]} />
      </div>
    </div>
  </section>`;
}

/* =========================================================================
   CTA + Footer
   ========================================================================= */
export function Cta() {
  return html`<section className="cta" aria-labelledby="cta-title">
    <div className="cta__goo vx-goo vx-goo--l" aria-hidden="true">
      <span className="cta__blob cta__blob--1" />
      <span className="cta__blob cta__blob--2" />
      <span className="cta__blob cta__blob--3" />
    </div>
    <div className="site-container cta__inner" data-reveal>
      <h2 className="cta__title" id="cta-title">Stop snapping.<br />Start flowing.</h2>
      <p className="cta__lede">Open source, MIT licensed and ready for your next release.</p>
      <div className="cta__actions">
        <${GooeyButton} size="lg" href=${GITHUB_URL} target="_blank" rel="noopener noreferrer" icon="github">Star on GitHub<//>
        <${GooeyButton} size="lg" variant="outline" href="#install" iconRight="arrowRight">Get started<//>
      </div>
    </div>
  </section>`;
}

export function SiteFooter() {
  const cols = [
    ['Library', [['Components', '#components'], ['Anatomy', '#anatomy'], ['Install', '#install'], ['FAQ', '#faq']]],
    ['Community', [['GitHub', GITHUB_URL], ['Issues', GITHUB_URL + '/issues'], ['Discussions', GITHUB_URL + '/discussions'], ['Releases', GITHUB_URL + '/releases']]],
    ['Project', [['MIT License', LICENSE_URL], ['Contributing', GITHUB_URL + '/blob/main/CONTRIBUTING.md'], ['Security', GITHUB_URL + '/blob/main/SECURITY.md']]],
  ];
  return html`<footer className="site-footer">
    <div className="site-container site-footer__grid">
      <div className="site-footer__brand">
        <a href="#top" className="site-brand"><${Logo} /><span>Viscous<em>/ui</em></span></a>
        <p>Gooey React components for interfaces that feel alive.</p>
      </div>
      ${cols.map(([t, links]) => html`<nav key=${t} aria-label=${t} className="site-footer__col">
        <h3>${t}</h3>
        <ul>${links.map(([l, h]) => {
          const external = /^https?:/.test(h);
          return html`<li key=${l}><a href=${h} target=${external ? '_blank' : undefined} rel=${external ? 'noopener noreferrer' : undefined}>${l}</a></li>`;
        })}</ul>
      </nav>`)}
    </div>
    <div className="site-container site-footer__base">
      <span>© ${new Date().getFullYear()} Viscous UI contributors.</span>
      <span>MIT licensed · built with Viscous UI.</span>
    </div>
  </footer>`;
}
