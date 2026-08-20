# Three-minute walkthrough

This pass shows the work in the same order I would review a small release handoff.

## 1. Establish the starting state

Open `index.html` through the local server. Keep **Broken · 1.4.2** and **Mobile 390 · simulated** selected, then run the scan.

Confirm the summary before looking at individual issues:

- score: 51/100;
- open findings: 5;
- severity split: 2 high, 2 medium, 1 low.

## 2. Read one finding end to end

Open **Pricing link reaches a removed route**. The detail view should show two reproduction steps, an expected result, the 1.4.2 result and the fixture route trace.

Use the severity filter to show only **High** findings. Two rows should remain: the pricing route and invalid email acceptance.

## 3. Change the test condition

Return the severity filter to **All findings**, switch the viewport to **Desktop 1440**, and run the broken fixture again. The promotion-row overflow check is narrow-layout specific, so the desktop result contains four findings rather than five.

## 4. Retest the correction

Switch back to **Mobile 390**, then choose **Retest fixed build**. The same five checks should now show **Resolved**, with no open findings and a score of 100/100.

## 5. Take the evidence with you

Choose **Export local report**. The downloaded JSON contains the selected build, simulated viewport, summary and the full evidence fields for each check. Export happens in the browser; the demo sends nothing to a server.

The matching written record is [the 1.4.3 retest report](../evidence/retest-1.4.3.md).
