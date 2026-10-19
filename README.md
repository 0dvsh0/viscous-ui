# Viscous UI — Gooey React components

An open-source library of gooey, physically-inspired **React** components in a **mono carbon** (black and white) theme. This repository contains the component source and the live landing page that showcases all 21 components.

- **Live site:** <https://0dvsh0.github.io/viscous-ui/>
- **Source:** <https://github.com/0dvsh0/viscous-ui>
- **License:** MIT
- **Status:** the site is production-ready and deploys from `main`; the npm package is being prepared as `@viscous-ui/react`. Until it ships, use the source from this repository.

## Architecture

Every component uses three layers:

1. **Goo layer**: plain shapes with the shared SVG filter applied (`feGaussianBlur` + alpha `feColorMatrix`). Never text.
2. **Content layer**: labels and icons with no filter, so they stay sharp.
3. **Hit layer**: native `button` / `input` / ARIA roles for keyboard and screen readers.

Motion uses only CSS transforms and transitions (no animation runtime) and respects `prefers-reduced-motion`. Demos below the fold are mounted only when they approach the viewport.

## Components (21)

| Category | Components |
|---|---|
| Navigation | `GooeyNav`, `GooeyTabs`, `GooeyPagination`, `GooeyStepper` |
| Inputs | `GooeyButton` (solid / outline / ghost, loading), `GooeySwitch`, `GooeySlider`, `GooeyCheckbox`, `GooeyRadioGroup`, `GooeySearch` |
| Overlays | `GooeyDialog` (focus trap, Esc, portal), `GooeyTooltip`, `GooeyMenu` (keyboard nav), `GooeyFab` (up/down/left/right/radial), `GooeyToaster` + `useToast` |
| Display | `GooeyCard`, `GooeyCarousel` (autoplay, swipe, keys), `GooeyAccordion`, `GooeyLoader` (orbit/morph/drip), `GooeyBadge`, `GooeyAvatarGroup`, `GooeyCursor` |

Primitives: `GooeyDefs` (mount once), `GooeyFilter`, `GOO_PRESETS` (xs/s/m/l), `Icon`.
Stateful components support `value` / `defaultValue` / `onChange`.

## Repository layout

```
index.html               production entry (React 18 UMD + htm, no build step)
404.html                 GitHub Pages fallback
css/viscous.css          library styles + tokens (dark / .vx-theme-light)
css/site.css             landing page styles
css/fonts.css            self-hosted Geist / Geist Mono
js/viscous/*.js          component source (ES modules)
js/site/*.js             landing page (app, sections, demos, shared, config)
vendor/                  pinned React, ReactDOM and htm builds
assets/                  fonts, social image, app icons
scripts/                 one-off asset generation and deploy validation
.github/workflows/       GitHub Pages deployment
```

All third-party runtime assets are self-hosted and pinned. There is no build step and no runtime dependency on a third-party CDN.

## Run locally

Serve the repository over HTTP (ES modules do not work from `file://`):

```bash
python -m http.server 4173
# open http://127.0.0.1:4173/
```

Or use any static server, for example `npx serve .`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, validates the static references, uploads the site as a Pages artifact and publishes it.

One-time setup in the GitHub repository:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Push `main` (or run the workflow manually from **Actions**).
3. The site is published at `https://0dvsh0.github.io/viscous-ui/`.

The deploy is a curated static file set (`index.html`, `404.html`, `css/`, `js/`, `vendor/`, `assets/`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `.nojekyll`). Run the same validation locally with:

```bash
node scripts/validate.mjs
```

## Using the components today

Load the pinned UMD dependencies, then import the ES modules:

```html
<script src="./vendor/react.production.min.js"></script>
<script src="./vendor/react-dom.production.min.js"></script>
<script src="./vendor/htm.umd.js"></script>
<script type="module" src="./app.js"></script>
```

```js
import './css/viscous.css';
import { html } from './js/viscous/core.js';
import { GooeyDefs, GooeyNav, GooeyButton } from './js/viscous/index.js';

export default function App() {
  return html`
    <${GooeyDefs} />
    <${GooeyNav} items=${[{ label: 'Home' }, { label: 'Docs' }]} />
    <${GooeyButton} iconRight="arrowRight">Get started<//>
  `;
}
```

Mount `<GooeyDefs />` once at the root. The stylesheet ships the tokens; no additional CSS setup is required.

## Theming

Override `--vx-ink`, `--vx-ink-fg`, `--vx-surface-*`, `--vx-line*`, `--vx-ease` etc., or add `.vx-theme-light` to any subtree. The landing page stores the selected theme in `localStorage` (`vx-theme`) and applies it before first paint.

## Production notes

- Strict CSP meta with a hash for the JSON-LD block; all scripts, fonts and images are same-origin.
- Pinned, self-hosted React/ReactDOM/htm builds with their licenses in `vendor/`.
- `prefers-reduced-motion`, visible focus states and skip-to-content navigation.
- Lazy-mounted demos, font preloading and a single social preview image for links.
- GitHub Pages is a global CDN and comfortably serves a static site at this size. For a custom domain, add `CNAME` and update the absolute URLs in `index.html`, `robots.txt`, `sitemap.xml` and `js/site/config.js`.

## Roadmap

- Publish `@viscous-ui/react` with a build and TypeScript declarations.
- Per-component documentation pages with prop tables.
- Drawer/sheet, combobox, date picker, toast swipe-to-dismiss.
- Visual regression tests and Storybook.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please report security issues privately as described in [SECURITY.md](SECURITY.md).
