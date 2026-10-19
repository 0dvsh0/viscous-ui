/* Landing — root React app */
import { html, ReactDOM, useState, useEffect } from '../viscous/core.js';
import { GooeyDefs, GooeyToaster } from '../viscous/index.js';
import { useReveal } from './shared.js';
import { SiteHeader, Hero, Marquee, Gallery, Anatomy, Principles, Install, Faq, Cta, SiteFooter } from './sections.js';

function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('vx-theme') || 'dark'; } catch (e) { return 'dark'; }
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('vx-theme-light', theme === 'light');
    root.classList.toggle('vx-theme-dark', theme !== 'light');
    try { localStorage.setItem('vx-theme', theme); } catch (e) {}
  }, [theme]);
  useReveal();

  return html`
    <${GooeyToaster}>
      <${GooeyDefs} />
      <a className="site-skip" href="#main">Skip to content</a>
      <${SiteHeader} theme=${theme} setTheme=${setTheme} />
      <main id="main">
        <${Hero} />
        <${Marquee} />
        <${Gallery} />
        <${Anatomy} />
        <${Principles} />
        <${Install} />
        <${Faq} />
        <${Cta} />
      </main>
      <${SiteFooter} />
    <//>`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
