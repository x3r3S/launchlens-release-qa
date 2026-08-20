# Three-minute walkthrough

This pass shows the work in the same order I would review a small release handoff.

## 1. Establish the starting state

Open `index.html` through the local server. Keep **Observed record · 1.4.2** and **Mobile 390 · simulated** selected, then load the recorded state.

Confirm the summary before looking at individual issues:

- score: 51/100;
- open findings: 5;
- severity split: 2 high, 2 medium, 1 low.

## 2. Read one finding end to end

Open **Pricing link reaches a removed route**. The detail view should show two intended reproduction steps, an expected result, the seeded 1.4.2 result and its explicitly labelled fixture record.

Use the severity filter to show only **High** findings. Two rows should remain: the pricing route and invalid email acceptance.

## 3. Change the recorded condition

Return the severity filter to **All findings**, switch the viewport to **Desktop 1440**, and load the observed record again. The seeded promotion-row overflow finding belongs only to the narrow record, so the desktop record contains four findings rather than five.

## 4. Retest the correction

Switch back to **Mobile 390**, then choose **Open fixed-build record**. The same five seeded findings should now show **Resolved**, with no open findings and a model score of 100/100.

The register, selected detail and release decision move to the passing retest record. The comparison itself remains a before/after record: observed 1.4.2 on the left and retest 1.4.3 on the right. Both panes remain available in the compact layout.

## 5. Take the record with you

Choose **Export record**. The downloaded JSON contains the selected record state, simulated viewport, summary and full seeded fields for each finding. Export happens in the browser; the demo sends nothing to a server.

The matching written record is [the 1.4.3 retest report](../evidence/retest-1.4.3.md).
