/* Viscous UI — overlays: GooeyDialog, GooeyTooltip, GooeyMenu, GooeyFab, GooeyToaster/useToast */
import {
  html, React, ReactDOM, useState, useRef, useEffect, useLayoutEffect, useCallback, useId,
  createContext, useContext, cx, Icon, useControllable, useOutsideClick,
} from './core.js';

/* small presence helper: keeps node mounted while its exit animation plays */
function usePresence(open, ms = 380) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState(open ? 'open' : 'closed');
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')));
      return () => cancelAnimationFrame(r);
    }
    setState('closed');
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, ms]);
  return [mounted, state];
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/* --------------------------------------------------------------------------
   GooeyDialog — the panel coalesces from droplets
   -------------------------------------------------------------------------- */
export function GooeyDialog({
  open, defaultOpen = false, onOpenChange, title, description, children, footer,
  size = 'md', closeOnBackdrop = true, className,
}) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const [mounted, state] = usePresence(isOpen, 420);
  const panel = useRef(null);
  const restore = useRef(null);
  const tid = useId();

  useEffect(() => {
    if (!isOpen) return;
    restore.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const f = panel.current && panel.current.querySelector(FOCUSABLE);
      (f || panel.current) && (f || panel.current).focus({ preventScroll: true });
    }, 60);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      restore.current && restore.current.focus && restore.current.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
    if (e.key === 'Tab' && panel.current) {
      const f = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  if (!mounted) return null;
  return ReactDOM.createPortal(html`
    <div className=${cx('vx-dialog', 'is-' + state, 'vx-dialog--' + size, className)} onKeyDown=${onKeyDown}>
      <div className="vx-dialog__backdrop" onClick=${() => closeOnBackdrop && setOpen(false)} />
      <div
        ref=${panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby=${title ? tid : undefined}
        aria-describedby=${description ? tid + '-d' : undefined}
        tabIndex="-1"
        className="vx-dialog__frame"
      >
        <span className="vx-goo vx-goo--l vx-dialog__goo" aria-hidden="true">
          <span className="vx-dialog__shape" />
          <span className="vx-dialog__drop vx-dialog__drop--1" />
          <span className="vx-dialog__drop vx-dialog__drop--2" />
          <span className="vx-dialog__drop vx-dialog__drop--3" />
        </span>
        <div className="vx-dialog__content">
          <button type="button" className="vx-dialog__close" aria-label="Close dialog" onClick=${() => setOpen(false)}>
            <${Icon} name="x" size=${16} />
          </button>
          ${title && html`<h2 id=${tid} className="vx-dialog__title">${title}</h2>`}
          ${description && html`<p id=${tid + '-d'} className="vx-dialog__desc">${description}</p>`}
          ${children && html`<div className="vx-dialog__body">${children}</div>`}
          ${footer && html`<div className="vx-dialog__footer">${footer}</div>`}
        </div>
      </div>
    </div>`, document.body);
}

/* --------------------------------------------------------------------------
   GooeyTooltip — a bubble that buds off its trigger
   -------------------------------------------------------------------------- */
export function GooeyTooltip({ content, children, side = 'top', delay = 120, className }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const id = useId();
  const show = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(timer.current); setOpen(false); };
  useEffect(() => () => clearTimeout(timer.current), []);
  return html`
    <span
      className=${cx('vx-tooltip', 'is-' + side, open && 'is-open', className)}
      onPointerEnter=${show}
      onPointerLeave=${hide}
      onFocus=${show}
      onBlur=${hide}
      onKeyDown=${(e) => e.key === 'Escape' && hide()}
      aria-describedby=${open ? id : undefined}
    >
      ${children}
      <span className="vx-tooltip__pop" aria-hidden=${!open}>
        <span className="vx-goo vx-goo--s">
          <span className="vx-tooltip__bud" />
          <span className="vx-tooltip__bubble" />
        </span>
        <span role="tooltip" id=${id} className="vx-tooltip__text">${content}</span>
      </span>
    </span>`;
}

/* --------------------------------------------------------------------------
   GooeyMenu — dropdown that pours out of its trigger
   -------------------------------------------------------------------------- */
export function GooeyMenu({ label = 'Options', icon, items, onSelect, align = 'start', className }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(-1);
  const root = useRef(null);
  const listRef = useRef(null);
  const id = useId();
  useOutsideClick(root, () => setOpen(false), open);

  useEffect(() => {
    if (open && focus >= 0 && listRef.current) {
      const el = listRef.current.querySelectorAll('[role="menuitem"]')[focus];
      el && el.focus({ preventScroll: true });
    }
  }, [open, focus]);

  const choose = (it) => { setOpen(false); onSelect && onSelect(it); it.onSelect && it.onSelect(); root.current.querySelector('.vx-menu__trigger').focus(); };

  const onKey = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpen(true); setFocus(0); return; }
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); root.current.querySelector('.vx-menu__trigger').focus(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus((f) => (f + 1) % items.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocus((f) => (f - 1 + items.length) % items.length); }
    if (e.key === 'Tab') setOpen(false);
  };

  return html`
    <div ref=${root} className=${cx('vx-menu', open && 'is-open', 'is-' + align, className)} style=${{ '--n': items.length }} onKeyDown=${onKey}>
      <span className="vx-goo vx-goo--m" aria-hidden="true">
        <span className="vx-menu__trigger-shape" />
        <span className="vx-menu__panel-shape" />
        ${items.map((_, i) => html`<span key=${i} className="vx-menu__drip" style=${{ '--i': i }} />`)}
      </span>
      <button
        type="button"
        className="vx-menu__trigger"
        aria-haspopup="menu"
        aria-expanded=${open}
        aria-controls=${id}
        onClick=${() => { setOpen(!open); setFocus(-1); }}
      >
        ${icon && html`<${Icon} name=${icon} size=${16} />`}
        <span>${label}</span>
        <${Icon} name="chevronDown" size=${16} className="vx-menu__chev" />
      </button>
      <ul ref=${listRef} id=${id} role="menu" className="vx-menu__list" aria-label=${label} hidden=${!open}>
        ${items.map((it, i) => html`<li key=${it.label} role="none" style=${{ '--i': i }}>
          <button type="button" role="menuitem" tabIndex="-1" className=${cx('vx-menu__item', it.danger && 'is-danger')} onClick=${() => choose(it)}>
            ${it.icon && html`<${Icon} name=${it.icon} size=${16} />`}
            <span>${it.label}</span>
            ${it.shortcut && html`<kbd>${it.shortcut}</kbd>`}
          </button>
        </li>`)}
      </ul>
    </div>`;
}

/* --------------------------------------------------------------------------
   GooeyFab — speed-dial: actions split off the main drop like cells
   direction: up | down | left | right | radial
   -------------------------------------------------------------------------- */
export function GooeyFab({ actions, direction = 'up', icon = 'plus', label = 'Quick actions', className }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useOutsideClick(root, () => setOpen(false), open);
  const vec = (i) => {
    const d = 64 * (i + 1);
    if (direction === 'radial') {
      const n = actions.length;
      const a = (-90 - 60 + (120 / Math.max(1, n - 1)) * i) * (Math.PI / 180);
      return [Math.cos(a) * 76, Math.sin(a) * 76];
    }
    return { up: [0, -d], down: [0, d], left: [-d, 0], right: [d, 0] }[direction];
  };
  return html`
    <div
      ref=${root}
      className=${cx('vx-fab', open && 'is-open', 'is-' + direction, className)}
      onKeyDown=${(e) => e.key === 'Escape' && setOpen(false)}
    >
      <span className="vx-goo vx-goo--m vx-fab__goo" aria-hidden="true">
        <span className="vx-fab__core" />
        ${actions.map((_, i) => {
          const [x, y] = vec(i);
          const st = { '--x': x + 'px', '--y': y + 'px', '--i': i };
          return html`<${React.Fragment} key=${i}>
            <span className="vx-fab__stem" style=${st} />
            <span className="vx-fab__cell" style=${st} />
          <//>`;
        })}
      </span>
      ${actions.map((a, i) => {
        const [x, y] = vec(i);
        return html`<button
          key=${a.label}
          type="button"
          className="vx-fab__action"
          style=${{ '--x': x + 'px', '--y': y + 'px', '--i': i }}
          aria-label=${a.label}
          title=${a.label}
          tabIndex=${open ? 0 : -1}
          aria-hidden=${!open}
          onClick=${() => { a.onClick && a.onClick(); setOpen(false); }}
        ><${Icon} name=${a.icon} size=${18} /></button>`;
      })}
      <button type="button" className="vx-fab__toggle" aria-expanded=${open} aria-label=${label} onClick=${() => setOpen(!open)}>
        <${Icon} name=${icon} size=${22} stroke=${2} />
      </button>
    </div>`;
}

/* --------------------------------------------------------------------------
   Toasts — notifications drip out of an anchored "island"
   <GooeyToaster> provides context; useToast() returns toast(msg, opts)
   -------------------------------------------------------------------------- */
const ToastCtx = createContext(null);
let toastSeq = 0;

export function GooeyToaster({ children, duration = 3600, position = 'top' }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 420);
  }, []);
  const toast = useCallback((title, opts = {}) => {
    const id = ++toastSeq;
    setToasts((t) => [{ id, title, ...opts }, ...t].slice(0, 4));
    setTimeout(() => dismiss(id), opts.duration || duration);
    return id;
  }, [duration, dismiss]);
  return html`
    <${ToastCtx.Provider} value=${toast}>
      ${children}
      ${ReactDOM.createPortal(html`
        <section className=${cx('vx-toaster', 'is-' + position, toasts.length && 'has-toasts')} aria-live="polite" aria-label="Notifications">
          <ol className="vx-toaster__list">
            ${toasts.map((t) => html`<${ToastItem} key=${t.id} toast=${t} onClose=${() => dismiss(t.id)} />`)}
          </ol>
        </section>`, document.body)}
    <//>`;
}

function ToastItem({ toast, onClose }) {
  const [shown, setShown] = useState(false);
  useLayoutEffect(() => { const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))); return () => cancelAnimationFrame(r); }, []);
  return html`
    <li className=${cx('vx-toast', shown && !toast.leaving && 'is-shown', toast.leaving && 'is-leaving')}>
      <div className="vx-toast__inner">
        <span className="vx-goo vx-goo--m" aria-hidden="true">
          <span className="vx-toast__neck" />
          <span className="vx-toast__body" />
        </span>
        <div className="vx-toast__content" role="status">
          <span className="vx-toast__icon"><${Icon} name=${toast.icon || 'check'} size=${16} stroke=${2} /></span>
          <span className="vx-toast__text">
            <strong>${toast.title}</strong>
            ${toast.description && html`<span>${toast.description}</span>`}
          </span>
          ${toast.action && html`<button type="button" className="vx-toast__action" onClick=${() => { toast.action.onClick && toast.action.onClick(); onClose(); }}>${toast.action.label}</button>`}
          <button type="button" className="vx-toast__close" aria-label="Dismiss notification" onClick=${onClose}><${Icon} name="x" size=${14} /></button>
        </div>
      </div>
    </li>`;
}

export function useToast() {
  const t = useContext(ToastCtx);
  if (!t) throw new Error('useToast() must be used inside <GooeyToaster>');
  return t;
}
