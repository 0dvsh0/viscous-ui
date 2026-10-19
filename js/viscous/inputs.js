/* Viscous UI — inputs: GooeyButton, GooeySwitch, GooeySlider, GooeyCheckbox, GooeyRadioGroup, GooeySearch */
import {
  html, useState, useRef, useId, useEffect, useCallback, cx, clamp, Icon,
  LiquidIndicator, useActiveRect, useControllable, useReducedMotion,
} from './core.js';
import { GooeyLoader } from './display.js';

/* --------------------------------------------------------------------------
   GooeyButton — the pill leans toward the pointer; clicks splash droplets
   variant: solid | outline | ghost      size: sm | md | lg
   -------------------------------------------------------------------------- */
let splashSeq = 0;
export function GooeyButton({
  children, variant = 'solid', size = 'md', icon, iconRight, loading = false,
  disabled, className, onClick, href, type = 'button', ...rest
}) {
  const ref = useRef(null);
  const [splashes, setSplashes] = useState([]);
  const reduced = useReducedMotion();

  const track = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const inset = r.height * 0.22;
    el.style.setProperty('--mx', clamp(e.clientX - r.left, inset, r.width - inset) + 'px');
    el.style.setProperty('--my', clamp(e.clientY - r.top, inset, r.height - inset) + 'px');
    el.style.setProperty('--ex', (e.clientX - r.left) + 'px');
    el.style.setProperty('--ey', (e.clientY - r.top) + 'px');
  }, []);

  const handleClick = (e) => {
    if (disabled || loading) { e.preventDefault(); return; }
    if (!reduced && ref.current) {
      const r = ref.current.getBoundingClientRect();
      const x = e.clientX ? e.clientX - r.left : r.width / 2;
      const y = e.clientY ? e.clientY - r.top : r.height / 2;
      const id = ++splashSeq;
      setSplashes((s) => [...s.slice(-2), { id, x, y }]);
      setTimeout(() => setSplashes((s) => s.filter((p) => p.id !== id)), 700);
    }
    onClick && onClick(e);
  };

  const Tag = href ? 'a' : 'button';
  return html`
    <${Tag}
      ref=${ref}
      href=${href}
      type=${href ? undefined : type}
      className=${cx('vx-btn', 'vx-btn--' + variant, 'vx-size-' + size, loading && 'is-loading', className)}
      disabled=${Tag === 'button' ? disabled : undefined}
      aria-disabled=${disabled || undefined}
      aria-busy=${loading || undefined}
      onPointerMove=${track}
      onPointerEnter=${track}
      onClick=${handleClick}
      ...${rest}
    >
      <span className="vx-goo vx-goo--s" aria-hidden="true">
        <span className="vx-btn__body" />
        <span className="vx-btn__lean" />
        ${splashes.map((s) => html`<span key=${s.id} className="vx-btn__splash" style=${{ '--sx': s.x + 'px', '--sy': s.y + 'px' }}>
          <i /><i /><i /><i />
        </span>`)}
      </span>
      <span className="vx-btn__label">
        ${icon && html`<${Icon} name=${icon} size=${size === 'sm' ? 14 : 16} />`}
        <span>${children}</span>
        ${iconRight && html`<${Icon} name=${iconRight} size=${size === 'sm' ? 14 : 16} />`}
      </span>
      ${loading && html`<span className="vx-btn__loader"><${GooeyLoader} variant="morph" size="sm" label="Loading" /></span>`}
    <//>`;
}

/* --------------------------------------------------------------------------
   GooeySwitch — a drop of ink that stretches across the track
   -------------------------------------------------------------------------- */
export function GooeySwitch({
  checked, defaultChecked = false, onChange, label, hideLabel = false, size = 'md', disabled, className, iconOn, iconOff,
}) {
  const [on, setOn] = useControllable(checked, defaultChecked, onChange);
  const id = useId();
  return html`
    <span className=${cx('vx-switch-field', disabled && 'is-disabled', className)}>
      <button
        id=${id}
        type="button"
        role="switch"
        aria-checked=${on}
        aria-label=${hideLabel ? label : undefined}
        disabled=${disabled}
        className=${cx('vx-switch', 'vx-size-' + size, on && 'is-on')}
        onClick=${() => setOn(!on)}
      >
        <span className="vx-switch__track" aria-hidden="true" />
        <span className="vx-goo vx-goo--s" aria-hidden="true">
          <span className="vx-switch__drop vx-switch__drop--trail" />
          <span className="vx-switch__drop vx-switch__drop--lead" />
        </span>
        ${(iconOn || iconOff) && html`<span className="vx-switch__icon" aria-hidden="true">
          <${Icon} name=${on ? iconOn || iconOff : iconOff || iconOn} size=${12} stroke=${2.25} />
        </span>`}
      </button>
      ${label && !hideLabel && html`<label htmlFor=${id} className="vx-switch__label">${label}</label>`}
    </span>`;
}

/* --------------------------------------------------------------------------
   GooeySlider — value bubble pulls out of the thumb while dragging
   -------------------------------------------------------------------------- */
export function GooeySlider({
  value, defaultValue = 50, onChange, min = 0, max = 100, step = 1, label = 'Value',
  format = (v) => v, showValue = true, disabled, className,
}) {
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [active, setActive] = useState(false);
  const p = (val - min) / (max - min || 1);
  const id = useId();
  return html`
    <div className=${cx('vx-slider', active && 'is-active', disabled && 'is-disabled', className)} style=${{ '--p': p }}>
      ${showValue && html`<div className="vx-slider__head">
        <label htmlFor=${id}>${label}</label>
        <output htmlFor=${id}>${format(val)}</output>
      </div>`}
      <div className="vx-slider__control">
        <span className="vx-slider__rail" aria-hidden="true" />
        <span className="vx-goo vx-goo--xs" aria-hidden="true">
          <span className="vx-slider__fill" />
          <span className="vx-slider__thumb" />
          <span className="vx-slider__bubble" />
        </span>
        <span className="vx-slider__bubble-label" aria-hidden="true">${format(val)}</span>
        <input
          id=${id}
          type="range"
          min=${min} max=${max} step=${step}
          value=${val}
          disabled=${disabled}
          aria-label=${showValue ? undefined : label}
          aria-valuetext=${String(format(val))}
          onChange=${(e) => setVal(Number(e.target.value))}
          onPointerDown=${() => setActive(true)}
          onPointerUp=${() => setActive(false)}
          onPointerCancel=${() => setActive(false)}
          onFocus=${(e) => e.target.matches(':focus-visible') && setActive(true)}
          onBlur=${() => setActive(false)}
          onKeyUp=${() => setActive(true)}
        />
      </div>
    </div>`;
}

/* --------------------------------------------------------------------------
   GooeyCheckbox — ink floods the box and splashes
   -------------------------------------------------------------------------- */
export function GooeyCheckbox({ checked, defaultChecked = false, onChange, label, description, disabled, className }) {
  const [on, setOn] = useControllable(checked, defaultChecked, onChange);
  const [burst, setBurst] = useState(0);
  return html`
    <label className=${cx('vx-check', on && 'is-on', disabled && 'is-disabled', className)}>
      <input
        type="checkbox"
        className="vx-visually-hidden"
        checked=${on}
        disabled=${disabled}
        onChange=${(e) => { setOn(e.target.checked); if (e.target.checked) setBurst((b) => b + 1); }}
      />
      <span className="vx-check__box" aria-hidden="true">
        <span className="vx-check__fill" />
        <span className="vx-goo vx-goo--xs">
          <span className="vx-check__bead" />
          ${burst > 0 && html`<span key=${burst} className="vx-check__burst"><i /><i /><i /><i /></span>`}
        </span>
        <svg className="vx-check__mark" viewBox="0 0 24 24" width="14" height="14"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      ${(label || description) && html`<span className="vx-check__text">
        ${label && html`<span className="vx-check__label">${label}</span>`}
        ${description && html`<span className="vx-check__desc">${description}</span>`}
      </span>`}
    </label>`;
}

/* --------------------------------------------------------------------------
   GooeyRadioGroup — one drop flows between options
   -------------------------------------------------------------------------- */
export function GooeyRadioGroup({ options, value, defaultValue, onChange, label, name, className, orientation = 'vertical' }) {
  const uid = useId();
  const keys = options.map((o) => o.value);
  const [val, setVal] = useControllable(value, defaultValue ?? keys[0], onChange);
  const index = Math.max(0, keys.indexOf(val));
  const ref = useRef(null);
  const [rect, ready] = useActiveRect(ref, index, [options.length, orientation]);
  const dot = rect && { x: rect.x + 5, y: rect.y + 5, w: rect.w - 10, h: rect.h - 10 };
  return html`
    <fieldset className=${cx('vx-radio', 'is-' + orientation, className)}>
      ${label && html`<legend className="vx-radio__legend">${label}</legend>`}
      <div ref=${ref} className=${cx('vx-liquid-group vx-radio__list', ready && 'is-ready')}>
        <span className="vx-goo vx-goo--xs" aria-hidden="true"><${LiquidIndicator} rect=${dot} /></span>
        ${options.map((o, i) => html`<label key=${o.value} className=${cx('vx-radio__option', i === index && 'is-active')}>
          <input
            type="radio"
            className="vx-visually-hidden"
            name=${name || uid}
            value=${o.value}
            checked=${i === index}
            onChange=${() => setVal(o.value)}
          />
          <span className="vx-radio__ring" data-vx-item aria-hidden="true" />
          <span className="vx-radio__text">
            <span className="vx-radio__label">${o.label}</span>
            ${o.description && html`<span className="vx-radio__desc">${o.description}</span>`}
          </span>
        </label>`)}
      </div>
    </fieldset>`;
}

/* --------------------------------------------------------------------------
   GooeySearch — a droplet button that pours itself into a field
   -------------------------------------------------------------------------- */
export function GooeySearch({
  value, defaultValue = '', onChange, onSubmit, placeholder = 'Search…', open, defaultOpen = false,
  onOpenChange, width = 320, label = 'Search', className,
}) {
  const [q, setQ] = useControllable(value, defaultValue, onChange);
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const input = useRef(null);
  const root = useRef(null);

  useEffect(() => { if (isOpen && input.current) input.current.focus({ preventScroll: true }); }, [isOpen]);

  const toggle = () => {
    if (isOpen && q) { onSubmit && onSubmit(q); return; }
    setOpen(!isOpen);
  };

  return html`
    <form
      ref=${root}
      role="search"
      className=${cx('vx-search', isOpen && 'is-open', className)}
      style=${{ '--w': width + 'px' }}
      onSubmit=${(e) => { e.preventDefault(); onSubmit && onSubmit(q); }}
      onKeyDown=${(e) => { if (e.key === 'Escape') { setOpen(false); } }}
    >
      <span className="vx-goo vx-goo--m" aria-hidden="true">
        <span className="vx-search__field" />
        <span className="vx-search__bridge" />
        <span className="vx-search__orb" />
      </span>
      <input
        ref=${input}
        className="vx-search__input"
        type="search"
        value=${q}
        placeholder=${placeholder}
        aria-label=${label}
        tabIndex=${isOpen ? 0 : -1}
        onChange=${(e) => setQ(e.target.value)}
        onBlur=${(e) => { if (!q && !root.current.contains(e.relatedTarget)) setOpen(false); }}
      />
      <button
        type="button"
        className="vx-search__btn"
        aria-label=${isOpen ? (q ? 'Submit search' : 'Close search') : 'Open search'}
        aria-expanded=${isOpen}
        onClick=${toggle}
      >
        <${Icon} name=${isOpen && !q ? 'x' : 'search'} size=${18} />
      </button>
    </form>`;
}
