# Retest record correction

The fixed-build view used to change each finding's status and Actual field but build its Evidence line by prefixing the original failing trace with "Retest passed". That produced contradictions such as a green PASS beside `GET /pricing-legacy → 404`.

The fixture now stores two explicitly seeded records for every finding: the invented 1.4.2 observed state and the invented 1.4.3 retest state. `loadFixtureRecord()` selects the record that belongs to the requested build, and the export identifies whether it is the observed or retest phase. The wording deliberately says "fixture record" rather than implying an HTTP, form, DOM, accessibility or geometry assertion ran.

The comparison preview is independent of that selection. Its left pane always represents the observed 1.4.2 fixture record and its right pane always represents the retest 1.4.3 fixture record, including on compact layouts. Choosing the fixed build updates the register, detail panel and release decision to the retest PASS state without replacing either side of the before/after record.

A browser regression now opens both UI states and checks that their labels and rendered seeded values agree. It asserts that both named preview regions remain visible and unchanged at wide and Mobile 390 browser sizes, and that the selected retest detail contains no stale 404 value. It also verifies the real LaunchLens page has no page-level horizontal overflow and exposes the Source and CI links. The regression does not execute the invented storefront scenarios. Domain and proof checks separately reject stale failure values in a resolved record.
