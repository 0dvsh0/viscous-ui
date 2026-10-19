# Contributing

Thanks for helping Viscous UI flow.

## Local setup

There is no build step. Serve the repository over HTTP:

```bash
python -m http.server 4173
# http://127.0.0.1:4173/
```

Before opening a pull request, run the static validation:

```bash
node scripts/validate.mjs
```

## What to work on

- Component bugs, accessibility issues and reduced-motion regressions.
- New components that fit the three-layer model (goo layer / content layer / native hit layer).
- Documentation, examples and the landing page.
- Performance work on the gallery and filter regions.

## Ground rules

- Keep the dependency surface at zero beyond the pinned React/ReactDOM/htm builds.
- Never put text inside the filtered goo layer. Text must stay on the content layer.
- Interactive components must render a native control with an accessible name, keyboard support and visible focus.
- Respect `prefers-reduced-motion`.
- Do not introduce a build step for the site without discussing it first.
- Keep light and dark themes working; check contrast at 4.5:1 for body text.

## Pull requests

1. Fork the repository and create a branch.
2. Make a focused change.
3. Run `node scripts/validate.mjs`.
4. Describe the change, the motivation and any visual/accessibility impact.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
