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

The Pricing item in the fixture header points to a route that has been removed. Someone following it from the main navigation reaches the fixture's 404 response instead of the pricing page.

## Reproduction

1. Open the fixture storefront header.
2. Activate **Pricing** in the main navigation.

## Expected

The Pricing link opens an available page.

## Actual in 1.4.2

The fixture returns a 404 response for `/pricing-legacy`.

## Evidence

`Fixture route check: GET /pricing-legacy → 404`

## Retest in 1.4.3

**Passed.** The link now targets `/pricing` and returns the fixture success page.

The route response is part of the deterministic fixture. This report does not describe a request to a public or client website.
