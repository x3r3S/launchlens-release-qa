# Retest record correction

The fixed-build view used to change each finding's status and Actual field but build its Evidence line by prefixing the original failing trace with "Retest passed". That produced contradictions such as a green PASS beside `GET /pricing-legacy → 404`.

The fixture now stores two explicitly seeded records for every finding: the invented 1.4.2 observed state and the invented 1.4.3 retest state. `loadFixtureRecord()` selects the record that belongs to the requested build, and the export identifies whether it is the observed or retest phase. The wording deliberately says "fixture record" rather than implying an HTTP, form, DOM, accessibility or geometry assertion ran.

A browser regression now opens both UI states and checks that their labels and rendered seeded values agree. It also verifies the real LaunchLens page has no page-level horizontal overflow and exposes the Source and CI links. The regression does not execute the invented storefront scenarios. Domain and proof checks separately reject stale failure values in a resolved record.
