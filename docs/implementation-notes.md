# Implementation and test notes

## Shape of the demo

LaunchLens is a static HTML, CSS and JavaScript project with no runtime dependencies and no backend. The page can be served from a simple local server or a static host such as GitHub Pages.

The code is split on purpose:

- `src/domain.mjs` owns the seeded record definitions, viewport rules, severity weighting and JSON report shape;
- `src/app.mjs` owns the controls, filters, detail panel, recorded preview state and browser download;
- `tests/domain.test.mjs` checks the deterministic record behavior without needing a browser;
- `tests/browser/evidence.spec.mjs` checks the LaunchLens observed/retest presentation, project links and responsive containment in Chromium;
- `scripts/verify-proof.mjs` checks that the written fixture records still match the current domain values.

## Fixture states

`loadFixtureRecord()` accepts only two record states, `broken` and `fixed`, and three named simulated viewports. An unknown build or viewport throws instead of silently returning a plausible result.

Each issue definition contains:

- a stable id and selector;
- category and severity;
- the viewports where it applies;
- intended reproduction steps for the invented case;
- expected behaviour plus seeded observed and corrected results;
- separate, explicitly labelled observed and retest fixture-record strings.

The seeded mobile overflow finding is intentionally absent from the 1440 px desktop record. The other four records apply to all configured viewports.

## Fixture score calculation

The fixture score is a compact model summary, not a measured quality score or industry standard. It begins at 100 and deducts points only for seeded open findings:

| Severity | Deduction |
| --- | ---: |
| Critical | 25 |
| High | 15 |
| Medium | 8 |
| Low | 3 |

With two high, two medium and one low finding, the broken Mobile 390 fixture scores `100 - 30 - 16 - 3 = 51`. The fixed fixture keeps the findings for retest traceability but marks them resolved, so its score is 100.

## Test coverage

The domain tests cover the seeded finding set, viewport-specific filtering, severity summary, fixed-record resolution, record completeness and phase selection, non-mutating filters, invalid input handling, report boundaries and JSON serialization.

The browser regression exercises both LaunchLens UI states at desktop and Mobile 390 sizes. It checks that the rendered seeded pricing, validation and accessibility values agree with their labels and Recorded result fields, verifies the Source and CI destinations, and confirms that the compact LaunchLens page does not create horizontal scrolling. It does not run those seeded checks against a storefront.

The record verifier is deliberately separate from the unit tests. It reads the two Markdown files and compares their quoted values with `loadFixtureRecord()` output. This makes stale portfolio copy a failing check rather than a documentation surprise.

## Boundaries

The UI preview is an illustration backed by hard-coded records, not an embedded storefront. Route outcomes, layout values, accessibility names and form outcomes are seeded data used to demonstrate a reporting workflow. Playwright automates the LaunchLens interface only. There is no storefront scanner, route request, form submission, DOM fixture, accessibility-tree capture, device lab, authentication, analytics or external write path in this project.
