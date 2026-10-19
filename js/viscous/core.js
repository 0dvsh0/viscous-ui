/* ==========================================================================
   Viscous UI — core
   Shared runtime: React bindings, the SVG goo filter stack, hooks and icons.
   Every component composes three layers:
     1. a GOO layer  (shapes only, filtered — never text)
     2. a CONTENT layer (crisp labels / icons on top)
     3. a HIT layer  (native, accessible interactive element)
   ========================================================================== */

const React = window.React;
const ReactDOM = window.ReactDOM;

export { React, ReactDOM };
export const html = window.htm.bind(React.createElement);
export const {
  useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo,
  useContext, createContext, useId, Fragment,
} = React;

/* ---------- utils ---------- */
export const cx = (...a) => a.filter(Boolean).join(' ');
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ---------- filter presets ----------
   blur   -> feGaussianBlur stdDeviation
   alpha  -> contrast multiplier applied to the alpha channel
   shift  -> negative offset (threshold) applied to the alpha channel        */
export const GOO_PRESETS = {
  xs: { blur: 3, alpha: 18, shift: -7 },
  s: { blur: 5, alpha: 20, shift: -8 },
  m: { blur: 8, alpha: 22, shift: -9 },
  l: { blur: 14, alpha: 30, shift: -12 },
};

export function GooeyFilter({ id, blur = 8, alpha = 22, shift = -9 }) {
  return html`
    <filter id=${id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation=${blur} result="blur" />
      <feColorMatrix
        in="blur"
        mode="matrix"
        values=${`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alpha} ${shift}`}
      />
    </filter>`;
}

/** Mount once at the root of your app. Registers #vx-goo-s / -m / -l. */
export function GooeyDefs() {
  return html`
    <svg className="vx-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        ${Object.entries(GOO_PRESETS).map(([k, p]) =>
          html`<${GooeyFilter} key=${k} id=${'vx-goo-' + k} ...${p} />`)}
      </defs>
    </svg>`;
}

/* ---------- hooks ---------- */
export function useControllable(value, defaultValue, onChange) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const ref = useRef(current);
  ref.current = current;
  const set = useCallback((next) => {
    const v = typeof next === 'function' ? next(ref.current) : next;
    if (!controlled) setInner(v);
    if (onChange) onChange(v);
  }, [controlled, onChange]);
  return [current, set];
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setReduced(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', fn) : mq.removeListener(fn));
  }, []);
  return reduced;
}

/** Measures the [data-vx-item] at `index` inside `containerRef`. */
export function useActiveRect(containerRef, index, deps = []) {
  const [rect, setRect] = useState(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const el = c.querySelectorAll('[data-vx-item]')[index];
    if (!el) return;
    setRect((r) => {
      const n = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      return r && r.x === n.x && r.y === n.y && r.w === n.w && r.h === n.h ? r : n;
    });
  }, [index, ...deps]);

  useLayoutEffect(() => { measure(); }, [measure]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    c.querySelectorAll('[data-vx-item]').forEach((el) => ro.observe(el));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (rect && !ready) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
      return () => cancelAnimationFrame(id);
    }
  }, [rect, ready]);

  return [rect, ready];
}

export function useOutsideClick(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(e); };
    document.addEventListener('pointerdown', fn);
    return () => document.removeEventListener('pointerdown', fn);
  }, [ref, handler, active]);
}

/* ---------- liquid indicator ----------
   Three blobs travel to the same target with staggered durations.
   Through the goo filter they read as ONE drop that stretches and snaps. */
export function LiquidIndicator({ rect, radius = 999 }) {
  if (!rect) return null;
  const base = { width: rect.w + 'px', height: rect.h + 'px', borderRadius: radius + 'px' };
  const t = `translate(${rect.x}px, ${rect.y}px)`;
  return html`
    <${Fragment}>
      <span className="vx-liquid vx-liquid--trail" style=${{ ...base, transform: t + ' scale(.92, .78)' }} />
      <span className="vx-liquid vx-liquid--bridge" style=${{ ...base, transform: t + ' scale(.96, .66)' }} />
      <span className="vx-liquid vx-liquid--lead" style=${{ ...base, transform: t }} />
    <//>`;
}

/* ---------- icons (24px grid, 1.75 stroke) ---------- */
const PATHS = {
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  arrowLeft: 'M19 12H5M11 19l-7-7 7-7',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  chevronDown: 'm6 9 6 6 6-6',
  heart: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  search: 'M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
  share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13',
  bookmark: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  layers: 'm12 2 10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  sparkle: 'M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6-5.6-1.9 5.6-1.9z',
  terminal: 'm4 17 6-6-6-6M12 19h8',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
  image: 'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  box: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  droplet: 'M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z',
  accessibility: 'M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4 8l8 2 8-2M12 10v5m0 0-4 7m4-7 4 7',
  feather: 'M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5zM16 8 2 22M17.5 15H9',
  palette: 'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3c.6.8.1 2.7-2.5 2.7zM7.5 11.5h.01M10.5 7.5h.01M15.5 7.5h.01',
  package: 'M16.5 9.4 7.5 4.2M21 16V8l-9-5-9 5v8l9 5zM3.3 7 12 12l8.7-5M12 22V12',
};

export function Icon({ name, size = 18, stroke = 1.75, className, title }) {
  if (name === 'github') {
    return html`<svg className=${cx('vx-icon', className)} width=${size} height=${size} viewBox="0 0 24 24" aria-hidden=${title ? undefined : 'true'} role=${title ? 'img' : undefined} fill="currentColor">
      ${title && html`<title>${title}</title>`}
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>`;
  }
  return html`<svg className=${cx('vx-icon', className)} width=${size} height=${size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth=${stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden=${title ? undefined : 'true'} role=${title ? 'img' : undefined}>
      ${title && html`<title>${title}</title>`}
      <path d=${PATHS[name] || PATHS.sparkle} />
    </svg>`;
}
