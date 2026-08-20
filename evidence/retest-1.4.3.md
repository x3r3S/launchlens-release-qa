# Retest notes — fixture build 1.4.3

**Scope:** the same five checks were run against builds 1.4.2 and 1.4.3 at the simulated Mobile 390 viewport (390 × 844).

## Summary

| Result | Broken 1.4.2 | Fixed 1.4.3 |
| --- | ---: | ---: |
| Release score | 51/100 | 100/100 |
| Open findings | 5 | 0 |
| Resolved findings | 0 | 5 |
| High | 2 | 0 |
| Medium | 2 | 0 |
| Low | 1 | 0 |

The score starts at 100 and deducts 15 points for each open high finding, 8 for each medium finding and 3 for each low finding. A resolved finding does not deduct points.

## Result by check

| ID | Check | Severity | Result in 1.4.2 | Retest result in 1.4.3 |
| --- | --- | --- | --- | --- |
| LL-001 | Pricing link reaches a removed route | High | `/pricing-legacy` returns the fixture 404 response | The link now targets `/pricing` and returns the fixture success page. |
| LL-002 | Signup accepts an invalid email address | High | `hello@` is accepted | Invalid input is rejected and the field receives an inline error. |
| LL-003 | Newsletter field has no programmatic label | Medium | Accessible name is empty | A visible label is associated with the input by id. |
| LL-004 | Promotion row overflows narrow viewports | Medium | Measured width is 436 px at a 390 px simulated viewport | The row wraps and its measured width stays within the viewport. |
| LL-005 | Newsletter controls reuse the same id | Low | Duplicate-id count is 2 | Each control now has a unique id. |

## Exit decision for this fixture

All five seeded checks return a resolved state in build 1.4.3, so this contained fixture passes its defined retest. That result is limited to the deterministic checks above. Cross-browser work, physical devices, exploratory testing, performance, security and integration behavior remain outside this exercise.

## Reproduce the result

From the repository root:

```powershell
npm test
npm run verify:evidence
```

The first command exercises the broken and fixed domain states. The second checks that the values quoted here still agree with the implementation.
