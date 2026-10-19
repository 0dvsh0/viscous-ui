/* Viscous UI — display: GooeyCard, GooeyCarousel, GooeyAccordion, GooeyLoader, GooeyBadge, GooeyAvatarGroup, GooeyCursor */
import {
  html, useState, useRef, useEffect, useId, useCallback, cx, Icon, useControllable, useReducedMotion,
} from './core.js';

/* --------------------------------------------------------------------------
   GooeyCard — an ink blob follows the pointer under the surface;
   the action button is fused to the card corner like surface tension
   -------------------------------------------------------------------------- */
export function GooeyCard({
  eyebrow, title, children, media, footer, action, href, tone = 'dark', className,
}) {
  const ref = useRef(null);
  const move = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--cx', e.clientX - r.left + 'px');
    el.style.setProperty('--cy', e.clientY - r.top + 'px');
  }, []);
  const Tag = href ? 'a' : 'article';
  return html`
    <${Tag} ref=${ref} href=${href} className=${cx('vx-card', 'is-' + tone, action && 'has-action', className)} onPointerMove=${move}>
      <span className="vx-goo vx-goo--l vx-card__goo" aria-hidden="true">
        <span className="vx-card__surface" />
        ${action && html`<span className="vx-card__notch" />`}
      </span>
      <span className="vx-card__ink" aria-hidden="true" />
      <div className="vx-card__content">
        ${media && html`<div className="vx-card__media">${media}</div>`}
        ${eyebrow && html`<span className="vx-card__eyebrow">${eyebrow}</span>`}
        ${title && html`<h3 className="vx-card__title">${title}</h3>`}
        ${children && html`<div className="vx-card__body">${children}</div>`}
        ${footer && html`<div className="vx-card__footer">${footer}</div>`}
      </div>
      ${action && html`<button
        type="button"
        className="vx-card__action"
        aria-label=${action.label}
        onClick=${(e) => { e.preventDefault(); action.onClick && action.onClick(e); }}
      ><${Icon} name=${action.icon || 'arrowUpRight'} size=${18} /></button>`}
    <//>`;
}

/* --------------------------------------------------------------------------
   GooeyCarousel — slides with liquid pagination dots
   -------------------------------------------------------------------------- */
export function GooeyCarousel({
  slides, index, defaultIndex = 0, onChange, autoplay = 0, label = 'Carousel', className,
}) {
  const [cur, setCur] = useControllable(index, defaultIndex, onChange);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const n = slides.length;
  const go = (i) => setCur(((i % n) + n) % n);
  const touch = useRef(null);

  useEffect(() => {
    if (!autoplay || paused || reduced) return;
    const t = setInterval(() => setCur((c) => (c + 1) % n), autoplay);
    return () => clearInterval(t);
  }, [autoplay, paused, reduced, n]);

  return html`
    <section
      className=${cx('vx-carousel', className)}
      aria-roledescription="carousel"
      aria-label=${label}
      onPointerEnter=${() => setPaused(true)}
      onPointerLeave=${() => setPaused(false)}
      onFocus=${() => setPaused(true)}
      onBlur=${() => setPaused(false)}
      onKeyDown=${(e) => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); }}
      onTouchStart=${(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd=${(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="vx-carousel__viewport">
        <div className="vx-carousel__track" style=${{ transform: `translateX(${-cur * 100}%)` }}>
          ${slides.map((s, i) => html`<div
            key=${i}
            className=${cx('vx-carousel__slide', i === cur && 'is-active')}
            role="group"
            aria-roledescription="slide"
            aria-label=${`${i + 1} of ${n}`}
            aria-hidden=${i !== cur}
            inert=${i !== cur ? '' : undefined}
          >${s}</div>`)}
        </div>
      </div>
      <div className="vx-carousel__controls">
        <button type="button" className="vx-carousel__arrow" aria-label="Previous slide" onClick=${() => go(cur - 1)}><${Icon} name="arrowLeft" size=${16} /></button>
        <div className="vx-carousel__dots" style=${{ '--i': cur, '--n': n }}>
          <span className="vx-goo vx-goo--xs" aria-hidden="true">
            ${slides.map((_, i) => html`<span key=${i} className="vx-carousel__dot-shape" style=${{ '--d': i }} />`)}
            <span className="vx-carousel__blob vx-carousel__blob--trail" />
            <span className="vx-carousel__blob" />
          </span>
          ${slides.map((_, i) => html`<button
            key=${i}
            type="button"
            className="vx-carousel__dot"
            aria-label=${'Go to slide ' + (i + 1)}
            aria-current=${i === cur ? 'true' : undefined}
            onClick=${() => go(i)}
          />`)}
        </div>
        <button type="button" className="vx-carousel__arrow" aria-label="Next slide" onClick=${() => go(cur + 1)}><${Icon} name="arrowRight" size=${16} /></button>
      </div>
    </section>`;
}

/* --------------------------------------------------------------------------
   GooeyAccordion — the open item's badge melts into the panel edge
   -------------------------------------------------------------------------- */
export function GooeyAccordion({ items, multiple = false, defaultOpen = [], className }) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const uid = useId();
  const toggle = (i) => setOpen((s) => {
    const n = new Set(multiple ? s : s.has(i) ? [i] : []);
    n.has(i) ? n.delete(i) : n.add(i);
    return n;
  });
  return html`
    <div className=${cx('vx-accordion', className)}>
      ${items.map((it, i) => {
        const isOpen = open.has(i);
        return html`<div key=${i} className=${cx('vx-accordion__item', isOpen && 'is-open')}>
          <h3 className="vx-accordion__heading">
            <button
              type="button"
              id=${uid + 'h' + i}
              aria-expanded=${isOpen}
              aria-controls=${uid + 'p' + i}
              className="vx-accordion__trigger"
              onClick=${() => toggle(i)}
            >
              <span>${it.title}</span>
              <span className="vx-accordion__badge" aria-hidden="true">
                <span className="vx-goo vx-goo--s">
                  <span className="vx-accordion__orb" />
                  <span className="vx-accordion__drip" />
                </span>
                <${Icon} name="plus" size=${16} stroke=${2} className="vx-accordion__plus" />
              </span>
            </button>
          </h3>
          <div id=${uid + 'p' + i} role="region" aria-labelledby=${uid + 'h' + i} className="vx-accordion__panel" inert=${isOpen ? undefined : ''}>
            <div className="vx-accordion__panel-inner"><div className="vx-accordion__content">${it.content}</div></div>
          </div>
        </div>`;
      })}
    </div>`;
}

/* --------------------------------------------------------------------------
   GooeyLoader — metaball spinners
   variant: orbit | morph | drip    size: sm | md | lg
   -------------------------------------------------------------------------- */
export function GooeyLoader({ variant = 'orbit', size = 'md', label = 'Loading', className }) {
  const count = variant === 'drip' ? 3 : variant === 'morph' ? 4 : 5;
  return html`
    <span className=${cx('vx-loader', 'vx-loader--' + variant, 'vx-size-' + size, className)} role="status">
      <span className=${'vx-goo vx-goo--' + (size === 'sm' ? 'xs' : size === 'lg' ? 'm' : 's')} aria-hidden="true">
        <span className="vx-loader__core" />
        ${Array.from({ length: count }, (_, i) => html`<span key=${i} className="vx-loader__ball" style=${{ '--i': i }} />`)}
      </span>
      <span className="vx-sr-only">${label}</span>
    </span>`;
}

/* --------------------------------------------------------------------------
   GooeyBadge — notification counter that drips out of its host
   -------------------------------------------------------------------------- */
export function GooeyBadge({ count = 0, max = 99, children, label = 'notifications', className }) {
  const shown = count > 0;
  const [pulse, setPulse] = useState(0);
  const prev = useRef(count);
  useEffect(() => { if (count > prev.current) setPulse((p) => p + 1); prev.current = count; }, [count]);
  return html`
    <span className=${cx('vx-badge', shown && 'is-shown', className)}>
      <span className="vx-goo vx-goo--s" aria-hidden="true">
        <span className="vx-badge__host" />
        <span key=${pulse} className="vx-badge__drop" />
      </span>
      <span className="vx-badge__child">${children}</span>
      <span className="vx-badge__count" aria-hidden="true">${count > max ? max + '+' : count}</span>
      <span className="vx-sr-only">${count + ' ' + label}</span>
    </span>`;
}

/* --------------------------------------------------------------------------
   GooeyAvatarGroup — avatars fuse as they spread on hover
   -------------------------------------------------------------------------- */
export function GooeyAvatarGroup({ people, max = 4, size = 40, className }) {
  const visible = people.slice(0, max);
  const extra = people.length - visible.length;
  const all = extra > 0 ? [...visible, { name: `${extra} more`, initials: '+' + extra, more: true }] : visible;
  return html`
    <div className=${cx('vx-avatars', className)} style=${{ '--s': size + 'px', '--n': all.length }} role="list" aria-label="Team members">
      <span className="vx-goo vx-goo--m" aria-hidden="true">
        ${all.map((_, i) => html`<span key=${i} className="vx-avatars__blob" style=${{ '--i': i }} />`)}
      </span>
      ${all.map((p, i) => html`<div key=${p.name} role="listitem" className=${cx('vx-avatars__item', p.more && 'is-more')} style=${{ '--i': i }} title=${p.name}>
        ${p.src ? html`<img src=${p.src} alt=${p.name} loading="lazy" />` : html`<span aria-label=${p.name}>${p.initials || p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>`}
      </div>`)}
    </div>`;
}

/* --------------------------------------------------------------------------
   GooeyCursor — a viscous cursor trail for hero areas (pointer: fine only)
   -------------------------------------------------------------------------- */
export function GooeyCursor({ targetRef, count = 9, size = 36, className }) {
  const dots = useRef([]);
  const reduced = useReducedMotion();
  useEffect(() => {
    const host = targetRef && targetRef.current;
    if (!host || reduced || !matchMedia('(pointer: fine)').matches) return;
    const pts = Array.from({ length: count }, () => ({ x: -200, y: -200, s: 0 }));
    let mx = -200, my = -200, raf = 0, inside = false, awake = false;
    const start = () => {
      if (!raf && document.visibilityState !== 'hidden') raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0;
      let x = mx, y = my;
      let fading = false;
      pts.forEach((p, i) => {
        p.x += (x - p.x) * (i === 0 ? 0.42 : 0.38);
        p.y += (y - p.y) * (i === 0 ? 0.42 : 0.38);
        const target = inside ? 1 - i / count : 0;
        p.s += (target - p.s) * 0.35;
        if (p.s > 0.01) fading = true;
        const el = dots.current[i];
        if (el) el.style.transform = `translate(${p.x - size / 2}px, ${p.y - size / 2}px) scale(${p.s})`;
        x = p.x; y = p.y;
      });
      awake = inside || fading;
      if (awake) start();
    };
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!inside) { inside = true; start(); }
    };
    const onLeave = () => { inside = false; start(); };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') { cancelAnimationFrame(raf); raf = 0; awake = false; }
      else if (inside) start();
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetRef, count, size, reduced]);
  return html`
    <span className=${cx('vx-cursor vx-goo vx-goo--l', className)} aria-hidden="true">
      ${Array.from({ length: count }, (_, i) => html`<span key=${i} ref=${(el) => (dots.current[i] = el)} className="vx-cursor__dot" style=${{ width: size + 'px', height: size + 'px' }} />`)}
    </span>`;
}
