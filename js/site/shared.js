/* Landing — shared helpers: code block, copy, section heading, reveal */
import { html, useState, useEffect, useRef, cx, Icon } from '../viscous/core.js';

/* Minimal JSX/JS highlighter — monochrome, weight & opacity based */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function highlight(code) {
  const tokens = [];
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('[^']*'|"[^"]*"|`[^`]*`)|(&lt;\/?[A-Za-z][\w.]*|\/?&gt;)|\b(import|from|export|const|let|return|function|default|true|false|null|new)\b|(\b\d+(\.\d+)?\b)|(\b[a-zA-Z_]\w*(?==))/g;
  const src = esc(code);
  let last = 0, m;
  while ((m = re.exec(src))) {
    tokens.push(src.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 't' : m[4] ? 'k' : m[5] ? 'n' : 'a';
    tokens.push(`<span class="tk-${cls}">${m[0]}</span>`);
    last = m.index + m[0].length;
  }
  tokens.push(src.slice(last));
  return tokens.join('');
}

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const t = document.createElement('textarea');
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (_) {}
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  };
  return [copied, copy];
}

export function CopyButton({ text, label = 'Copy code', className }) {
  const [copied, copy] = useCopy();
  return html`<button type="button" className=${cx('site-copy', copied && 'is-copied', className)} onClick=${() => copy(text)} aria-label=${copied ? 'Copied' : label}>
    <${Icon} name=${copied ? 'check' : 'copy'} size=${14} />
  </button>`;
}

export function CodeBlock({ code, filename, className }) {
  return html`<div className=${cx('site-code', className)}>
    ${filename && html`<div className="site-code__bar">
      <span className="site-code__dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="site-code__file">${filename}</span>
      <${CopyButton} text=${code} />
    </div>`}
    ${!filename && html`<${CopyButton} text=${code} className="site-code__float" />`}
    <pre tabIndex="0"><code dangerouslySetInnerHTML=${{ __html: highlight(code) }} /></pre>
  </div>`;
}

export function SectionHead({ index, eyebrow, title, lede, align = 'left' }) {
  return html`<header className=${cx('site-head', 'is-' + align)} data-reveal>
    <p className="site-eyebrow"><span>${index}</span>${eyebrow}</p>
    <h2 className="site-h2">${title}</h2>
    ${lede && html`<p className="site-lede">${lede}</p>`}
  </header>`;
}

/* Adds .is-in to [data-reveal] elements as they scroll into view.
   A rAF-throttled scroll check is more forgiving than IntersectionObserver
   during fast scrolling and still picks up tiles replaced by the filter. */
export function useReveal() {
  useEffect(() => {
    const root = document.getElementById('root');
    let raf = 0;
    const run = () => {
      raf = 0;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.94) el.classList.add('is-in');
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const mo = root ? new MutationObserver(schedule) : null;
    mo && mo.observe(root, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mo && mo.disconnect();
    };
  }, []);
}

/* Mounts heavy demos only when they approach the viewport. */
export function useInView(rootMargin = '600px 0px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);
  return [ref, inView];
}

export function Logo({ size = 28 }) {
  return html`<span className="site-logo" aria-hidden="true" style=${{ width: size + 'px', height: size + 'px' }}>
    <span className="vx-goo vx-goo--xs">
      <span className="site-logo__a" />
      <span className="site-logo__b" />
    </span>
  </span>`;
}
