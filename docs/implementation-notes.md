# Implementation and test notes

## Shape of the demo

LaunchLens is a static HTML, CSS and JavaScript project with no runtime dependencies and no backend. The page can be served from a simple local server or a static host such as GitHub Pages.

The code is split on purpose:

- `src/domain.mjs` owns the fixture definitions, viewport rules, severity weighting and JSON report shape;
- `src/app.mjs` owns the controls, filters, detail panel, preview state and browser download;
- `tests/domain.test.mjs` checks the deterministic behavior without needing a browser;
- `scripts/verify-proof.mjs` checks that the written QA evidence still matches the current domain values.

## Fixture states

`scanFixture()` accepts only two builds, `broken` and `fixed`, and three named simulated viewports. An unknown build or viewport throws instead of silently returning a plausible result.

Each issue definition contains:

- a stable id and selector;
- category and severity;
- the viewports where it applies;
- reproduction steps;
- expected, broken and corrected results;
- a compact fixture evidence string.

The mobile overflow finding is intentionally absent from the 1440 px desktop scan. The other four checks apply to all configured viewports.

## Score calculation

The release score is a compact summary for this fixture, not an industry standard. It begins at 100 and deducts points only for open findings:

| Severity | Deduction |
| --- | ---: |
| Critical | 25 |
| High | 15 |
| Medium | 8 |
| Low | 3 |

With two high, two medium and one low finding, the broken Mobile 390 fixture scores `100 - 30 - 16 - 3 = 51`. The fixed fixture keeps the findings for retest traceability but marks them resolved, so its score is 100.

## Test coverage

The domain tests cover the issue set, viewport-specific filtering, severity summary, fixed-build resolution, evidence completeness, non-mutating filters, invalid input handling, report boundaries and JSON serialization.

The evidence verifier is deliberately separate from the unit tests. It reads the two Markdown reports and compares their quoted values with live `scanFixture()` results. This makes stale portfolio evidence a failing check rather than a documentation surprise.

## Boundaries

The UI preview is a controlled fixture, not an embedded storefront. Route responses, layout geometry, accessibility output and form behavior are deterministic records used to exercise the QA workflow. There is no network scanner, browser automation, device lab, authentication, analytics or external write path in this project.
