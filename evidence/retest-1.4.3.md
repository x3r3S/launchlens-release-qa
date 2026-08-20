# Retest notes — fixture build 1.4.3

**Scope:** the same five seeded findings are compared between the 1.4.2 and 1.4.3 fixture records at a simulated Mobile 390 viewport (390 × 844). No storefront, route, form, DOM, accessibility tree or layout engine was tested to create these values.

## Summary

| Result | Broken 1.4.2 | Fixed 1.4.3 |
| --- | ---: | ---: |
| Fixture score | 51/100 | 100/100 |
| Open findings | 5 | 0 |
| Resolved findings | 0 | 5 |
| High | 2 | 0 |
| Medium | 2 | 0 |
| Low | 1 | 0 |

The score starts at 100 and deducts 15 points for each open high finding, 8 for each medium finding and 3 for each low finding. A resolved finding does not deduct points.

## Recorded finding comparison

| ID | Seeded finding | Severity | Recorded state in 1.4.2 | Recorded retest state in 1.4.3 | Retest fixture record |
| --- | --- | --- | --- | --- | --- |
| LL-001 | Pricing link reaches a removed route | High | The seeded 1.4.2 record marks /pricing-legacy as a 404 outcome. | The seeded 1.4.3 retest record marks /pricing as a 200 outcome. | `Fixture record (retest): pricing target=/pricing; recorded outcome=200` |
| LL-002 | Signup accepts an invalid email address | High | The seeded 1.4.2 record marks hello@ as accepted. | The seeded 1.4.3 retest record marks hello@ as rejected with an inline error. | `Fixture record (retest): input=hello@; recorded outcome=rejected; inline error=present` |
| LL-003 | Newsletter field has no programmatic label | Medium | The seeded 1.4.2 record has no accessible name for the newsletter field. | The seeded 1.4.3 retest record gives the newsletter field the name Email. | `Fixture record (retest): recorded accessible name='Email'` |
| LL-004 | Promotion row overflows narrow viewports | Medium | The seeded Mobile 390 record is 46 px wider than its simulated viewport. | The seeded Mobile 390 retest record fits the simulated viewport and marks wrapping enabled. | `Simulated fixture record (retest): row=390 px; viewport=390 px; overflow=0; wrap=enabled` |
| LL-005 | Newsletter controls reuse the same id | Low | The seeded 1.4.2 record contains two newsletter-email ids. | The seeded 1.4.3 retest record contains no duplicate newsletter control id. | `Fixture record (retest): recorded duplicate newsletter-email id count=0` |

## Exit decision for this fixture

All five seeded findings are marked resolved in the 1.4.3 record, so the contained comparison reaches its fixture pass state. This is a model-consistency result, not product test evidence. Cross-browser work, physical devices, HTTP behavior, DOM behavior, accessibility, exploratory testing, performance, security and integrations remain outside this exercise.

## Verify model consistency

From the repository root:

```powershell
pnpm test
pnpm run verify:evidence
```

The first command checks the two deterministic record states. The second checks that the values quoted here still agree with the implementation.
