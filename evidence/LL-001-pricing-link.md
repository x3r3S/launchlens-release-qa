# LL-001 — Pricing link reaches a removed route

| Field | Value |
| --- | --- |
| Fixture | Northstar Store |
| Build found | Broken 1.4.2 |
| Retested in | Fixed 1.4.3 |
| Area | Link integrity |
| Severity | High |
| Viewport | Mobile 390 (simulated, 390 × 844) |
| Selector | `nav a[href='/pricing-legacy']` |
| Status after retest | Resolved |

## Problem

This seeded case models a Pricing item that points to a removed route. The 1.4.2 fixture record marks that target as a 404 outcome; LaunchLens does not make an HTTP request to verify it.

## Recorded reproduction steps

These steps belong to the invented case and were not executed by this app.

1. Open the fixture storefront header.
2. Activate **Pricing** in the main navigation.

## Expected

The Pricing link opens an available page.

## Actual in 1.4.2

The seeded 1.4.2 record marks `/pricing-legacy` as a 404 outcome.

## Observed fixture record

`Fixture record (observed): pricing target=/pricing-legacy; recorded outcome=404`

## Retest in 1.4.3

**Recorded as resolved.** The seeded 1.4.3 retest record marks `/pricing` as a 200 outcome.

**Retest record:** `Fixture record (retest): pricing target=/pricing; recorded outcome=200`

Both outcomes are deterministic fixture data. This report does not claim that a public or client route was requested.
