# Changelog

## Unreleased

- Kept the observed 1.4.2 and retest 1.4.3 preview panes stable while the selected record changes.
- Restored the full before/after comparison on compact layouts instead of hiding the retest pane.
- Added domain and Chromium wide/mobile regressions for preview names, content, visibility and post-retest invariance.

## 1.3.0 — 2026-08-20

- Corrected a retest-model bug that paired resolved statuses with stale failing evidence.
- Added distinct observed and passing traces for pricing, validation, accessibility, responsive layout and duplicate-id checks.
- Added Chromium regressions for rendered evidence semantics and compact-layout overflow.
- Made observed failure and passing retest evidence easier to distinguish in the detail panel.
- Documented the root cause and the guardrails that prevent the contradiction from returning.
- Relabelled every seeded outcome as a fixture record so the demo cannot be mistaken for executed storefront, HTTP, DOM, accessibility or geometry testing.
- Added accessible Source and CI links to the desktop and compact headers.

## 1.2.0 — 2026-08-20

- Added a complete sample bug report for the broken pricing route.
- Added a five-check before/after retest record for fixture build 1.4.3.
- Added a short review walkthrough and practical implementation notes.
- Added an evidence check that fails when quoted report values drift from the domain model.

## 1.1.0 — 2026-08-19

- Reframed the interface as an editorial QA evidence file instead of a generic dashboard.
- Added an early mobile score and severity snapshot before the scan controls.
- Removed portfolio-status badging from the product screen while preserving truthful case-study disclosure in the README.
- Corrected the project-server preview instructions.

## 1.0.0 — 2026-08-19

- Added the synthetic broken and fixed fixture builds.
- Added five deterministic QA findings with severity, reproduction, expected/actual behavior, and evidence.
- Added simulated viewport switching, issue filtering, fixed-build retest, and local JSON export.
- Added responsive, keyboard-accessible presentation and focused domain tests.
