/* Viscous UI — navigation: GooeyNav, GooeyTabs, GooeyPagination, GooeyStepper */
import {
  html, useRef, useMemo, useId, cx, Icon, LiquidIndicator,
  useActiveRect, useControllable,
} from './core.js';

const keyOf = (it) => it.value ?? it.href ?? it.label;

/* --------------------------------------------------------------------------
   GooeyNav — pill navigation with a liquid active indicator
   -------------------------------------------------------------------------- */
export function GooeyNav({
  items, value, defaultValue, onChange, size = 'md', className, label = 'Main',
}) {
  const keys = items.map(keyOf);
  const [val, setVal] = useControllable(value, defaultValue ?? keys[0], onChange);
  const index = Math.max(0, keys.indexOf(val));
  const ref = useRef(null);
  const [rect, ready] = useActiveRect(ref, index, [items.length, size]);

  return html`
    <nav ref=${ref} className=${cx('vx-liquid-group vx-nav', 'vx-size-' + size, ready && 'is-ready', className)} aria-label=${label}>
      <span className="vx-goo vx-goo--m" aria-hidden="true"><${LiquidIndicator} rect=${rect} /></span>
      <ul className="vx-nav__list">
        ${items.map((it, i) => {
          const active = i === index;
          const Tag = it.href ? 'a' : 'button';
          return html`<li key=${keys[i]}>
            <${Tag}
              data-vx-item
              className=${cx('vx-liquid-item', active && 'is-active')}
              href=${it.href}
              type=${it.href ? undefined : 'button'}
              aria-current=${active ? 'page' : undefined}
              onClick=${(e) => { setVal(keys[i]); it.onClick && it.onClick(e); }}
            >
              ${it.icon && html`<${Icon} name=${it.icon} size=${16} />`}
              <span>${it.label}</span>
            <//>
          </li>`;
        })}
      </ul>
    </nav>`;
}

/* --------------------------------------------------------------------------
   GooeyTabs — WAI-ARIA tabs / segmented control with liquid selection
   -------------------------------------------------------------------------- */
export function GooeyTabs({
  items, value, defaultValue, onChange, size = 'md', block = false, className, label = 'Tabs',
}) {
  const uid = useId();
  const keys = items.map(keyOf);
  const [val, setVal] = useControllable(value, defaultValue ?? keys[0], onChange);
  const index = Math.max(0, keys.indexOf(val));
  const ref = useRef(null);
  const [rect, ready] = useActiveRect(ref, index, [items.length, size, block]);
  const hasPanels = items.some((i) => i.content !== undefined);

  const onKeyDown = (e) => {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = null;
    if (e.key in map) next = (index + map[e.key] + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    if (next === null) return;
    e.preventDefault();
    setVal(keys[next]);
    const btn = ref.current.querySelectorAll('[role="tab"]')[next];
    btn && btn.focus();
  };

  return html`
    <div className=${cx('vx-tabs', className)}>
      <div
        ref=${ref}
        role="tablist"
        aria-label=${label}
        onKeyDown=${onKeyDown}
        className=${cx('vx-liquid-group vx-tabs__list', 'vx-size-' + size, block && 'is-block', ready && 'is-ready')}
      >
        <span className="vx-goo vx-goo--m" aria-hidden="true"><${LiquidIndicator} rect=${rect} /></span>
        ${items.map((it, i) => {
          const active = i === index;
          return html`<button
            key=${keys[i]}
            data-vx-item
            role="tab"
            type="button"
            id=${uid + '-t' + i}
            aria-selected=${active}
            aria-controls=${hasPanels ? uid + '-p' + i : undefined}
            tabIndex=${active ? 0 : -1}
            className=${cx('vx-liquid-item', active && 'is-active')}
            onClick=${() => setVal(keys[i])}
          >
            ${it.icon && html`<${Icon} name=${it.icon} size=${16} />`}
            <span>${it.label}</span>
          </button>`;
        })}
      </div>
      ${hasPanels && html`
        <div
          key=${keys[index]}
          role="tabpanel"
          id=${uid + '-p' + index}
          aria-labelledby=${uid + '-t' + index}
          tabIndex="0"
          className="vx-tabs__panel"
        >${items[index].content}</div>`}
    </div>`;
}

/* --------------------------------------------------------------------------
   GooeyPagination — page numbers with a liquid current-page drop
   -------------------------------------------------------------------------- */
function pageRange(count, page, sib) {
  const n = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  if (count <= sib * 2 + 5) return n(1, count);
  const left = Math.max(page - sib, 1);
  const right = Math.min(page + sib, count);
  const showL = left > 3;
  const showR = right < count - 2;
  const span = 3 + 2 * sib;
  if (!showL && showR) return [...n(1, span), 'r', count];
  if (showL && !showR) return [1, 'l', ...n(count - span + 1, count)];
  return [1, 'l', ...n(left, right), 'r', count];
}

export function GooeyPagination({
  count, page, defaultPage = 1, onChange, siblings = 1, className, label = 'Pagination',
}) {
  const [cur, setCur] = useControllable(page, defaultPage, onChange);
  const range = useMemo(() => pageRange(count, cur, siblings), [count, cur, siblings]);
  const nums = range.filter((x) => typeof x === 'number');
  const ref = useRef(null);
  const [rect, ready] = useActiveRect(ref, nums.indexOf(cur), [range.join(',')]);
  const go = (p) => setCur(Math.min(count, Math.max(1, p)));

  return html`
    <nav className=${cx('vx-pagination', className)} aria-label=${label}>
      <button type="button" className="vx-pagination__step" onClick=${() => go(cur - 1)} disabled=${cur <= 1} aria-label="Previous page">
        <${Icon} name="arrowLeft" size=${16} />
      </button>
      <div ref=${ref} className=${cx('vx-liquid-group vx-pagination__pages', ready && 'is-ready')}>
        <span className="vx-goo vx-goo--s" aria-hidden="true"><${LiquidIndicator} rect=${rect} /></span>
        ${range.map((p) => typeof p === 'number'
          ? html`<button
              key=${p}
              type="button"
              data-vx-item
              className=${cx('vx-liquid-item vx-pagination__page', p === cur && 'is-active')}
              aria-current=${p === cur ? 'page' : undefined}
              aria-label=${'Page ' + p}
              onClick=${() => go(p)}
            >${p}</button>`
          : html`<span key=${p} className="vx-pagination__gap" aria-hidden="true">…</span>`)}
      </div>
      <button type="button" className="vx-pagination__step" onClick=${() => go(cur + 1)} disabled=${cur >= count} aria-label="Next page">
        <${Icon} name="arrowRight" size=${16} />
      </button>
    </nav>`;
}

/* --------------------------------------------------------------------------
   GooeyStepper — progress that flows from node to node like poured ink
   -------------------------------------------------------------------------- */
export function GooeyStepper({ steps, current = 0, className, label = 'Progress' }) {
  const last = Math.max(1, steps.length - 1);
  const p = Math.min(current, last) / last;
  return html`
    <div className=${cx('vx-stepper', className)} style=${{ '--p': p }} role="group" aria-label=${label}>
      <div className="vx-stepper__rail">
        <span className="vx-stepper__line" aria-hidden="true" />
        ${steps.map((_, i) => html`<span key=${'b' + i} className="vx-stepper__base" style=${{ '--x': i / last }} aria-hidden="true" />`)}
        <span className="vx-goo vx-goo--xs" aria-hidden="true">
          <span className="vx-stepper__fill" />
          <span className="vx-stepper__head" />
          ${steps.map((_, i) => html`<span key=${'g' + i} className=${cx('vx-stepper__ink', i <= current && 'is-on')} style=${{ '--x': i / last }} />`)}
        </span>
        <ol className="vx-stepper__nodes">
          ${steps.map((s, i) => {
            const state = i < current ? 'done' : i === current ? 'current' : 'todo';
            return html`<li
              key=${i}
              className=${cx('vx-stepper__node', 'is-' + state)}
              style=${{ '--x': i / last }}
              aria-current=${state === 'current' ? 'step' : undefined}
            >
              <span className="vx-stepper__mark">${state === 'done' ? html`<${Icon} name="check" size=${14} stroke=${2.25} />` : i + 1}</span>
              <span className="vx-stepper__label">${s.label}<span className="vx-sr-only">${' — ' + state}</span></span>
            </li>`;
          })}
        </ol>
      </div>
    </div>`;
}
