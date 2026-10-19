# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Use GitHub’s private vulnerability reporting on the repository (**Security → Report a vulnerability**) or email the maintainer listed on the GitHub profile. Include:

- affected file(s) and version/commit,
- a reproduction or proof of concept,
- the impact you believe it has.

You can expect an acknowledgement within a few days and an update once the report has been triaged. Please give us reasonable time to ship a fix before publishing details.

## Scope

This is a static, client-side site with no backend, no authentication and no user data collection. Relevant issues include script injection through repository content, dependency compromise, CSP bypasses and broken outbound links. GitHub Pages itself and the browser runtime are out of scope.

## Hardening already in place

- All runtime scripts are self-hosted and pinned in `vendor/`.
- A strict Content-Security-Policy meta tag limits scripts to same-origin files plus a SHA-256 hash for the JSON-LD block.
- No analytics, cookies or third-party requests are made by the site.
- External links use `rel="noopener noreferrer"`.
