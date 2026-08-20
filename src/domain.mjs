const cleanText = (value, limit = 240) => String(value ?? "")
  .replace(/[\u0000-\u001F\u007F]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, limit);

export const VIEWPORTS = Object.freeze({
  "mobile-390": Object.freeze({ id: "mobile-390", label: "Mobile 390", width: 390, height: 844 }),
  "mobile-412": Object.freeze({ id: "mobile-412", label: "Mobile 412", width: 412, height: 915 }),
  "desktop-1440": Object.freeze({ id: "desktop-1440", label: "Desktop 1440", width: 1440, height: 900 })
});

const BLUEPRINTS = Object.freeze([
  Object.freeze({
    id: "broken-pricing-link",
    title: "Pricing link reaches a removed route",
    category: "Link integrity",
    severity: "high",
    selector: "nav a[href='/pricing-legacy']",
    viewports: Object.freeze(Object.keys(VIEWPORTS)),
    repro: Object.freeze(["Open the fixture storefront header.", "Activate Pricing in the main navigation."]),
    expected: "The Pricing link opens an available page.",
    actual: "The seeded 1.4.2 record marks /pricing-legacy as a 404 outcome.",
    resolvedActual: "The seeded 1.4.3 retest record marks /pricing as a 200 outcome.",
    observedEvidence: "Fixture record (observed): pricing target=/pricing-legacy; recorded outcome=404",
    resolvedEvidence: "Fixture record (retest): pricing target=/pricing; recorded outcome=200"
  }),
  Object.freeze({
    id: "invalid-email-accepted",
    title: "Signup accepts an invalid email address",
    category: "Form validation",
    severity: "high",
    selector: "form[data-fixture='newsletter']",
    viewports: Object.freeze(Object.keys(VIEWPORTS)),
    repro: Object.freeze(["Enter hello@ in the email field.", "Activate Join the list."]),
    expected: "Submission is blocked with a useful inline error.",
    actual: "The seeded 1.4.2 record marks hello@ as accepted.",
    resolvedActual: "The seeded 1.4.3 retest record marks hello@ as rejected with an inline error.",
    observedEvidence: "Fixture record (observed): input=hello@; recorded outcome=accepted",
    resolvedEvidence: "Fixture record (retest): input=hello@; recorded outcome=rejected; inline error=present"
  }),
  Object.freeze({
    id: "email-label-missing",
    title: "Newsletter field has no programmatic label",
    category: "Accessibility",
    severity: "medium",
    selector: "input[name='newsletter-email']",
    viewports: Object.freeze(Object.keys(VIEWPORTS)),
    repro: Object.freeze(["Inspect the newsletter input accessibility name.", "Navigate to the field using the keyboard."]),
    expected: "The input exposes the visible Email label to assistive technology.",
    actual: "The seeded 1.4.2 record has no accessible name for the newsletter field.",
    resolvedActual: "The seeded 1.4.3 retest record gives the newsletter field the name Email.",
    observedEvidence: "Fixture record (observed): recorded accessible name='(empty)'",
    resolvedEvidence: "Fixture record (retest): recorded accessible name='Email'"
  }),
  Object.freeze({
    id: "promo-row-overflow",
    title: "Promotion row overflows narrow viewports",
    category: "Responsive layout",
    severity: "medium",
    selector: ".promotion-row",
    viewports: Object.freeze(["mobile-390", "mobile-412"]),
    repro: Object.freeze(["Select a simulated narrow viewport.", "Inspect the promotion row at the top of the fixture."]),
    expected: "Content wraps without horizontal scrolling.",
    actual: "The seeded Mobile 390 record is 46 px wider than its simulated viewport.",
    resolvedActual: "The seeded Mobile 390 retest record fits the simulated viewport and marks wrapping enabled.",
    observedEvidence: "Simulated fixture record (observed): row=436 px; viewport=390 px; overflow=46 px",
    resolvedEvidence: "Simulated fixture record (retest): row=390 px; viewport=390 px; overflow=0; wrap=enabled"
  }),
  Object.freeze({
    id: "duplicate-newsletter-id",
    title: "Newsletter controls reuse the same id",
    category: "Markup quality",
    severity: "low",
    selector: "#newsletter-email",
    viewports: Object.freeze(Object.keys(VIEWPORTS)),
    repro: Object.freeze(["Parse the fixture DOM.", "Count elements with id newsletter-email."]),
    expected: "Every id value is unique within the page.",
    actual: "The seeded 1.4.2 record contains two newsletter-email ids.",
    resolvedActual: "The seeded 1.4.3 retest record contains no duplicate newsletter control id.",
    observedEvidence: "Fixture record (observed): recorded duplicate newsletter-email id count=2",
    resolvedEvidence: "Fixture record (retest): recorded duplicate newsletter-email id count=0"
  })
]);

const WEIGHTS = Object.freeze({ critical: 25, high: 15, medium: 8, low: 3 });

export function summarizeIssues(issues = []) {
  const summary = { total: issues.length, open: 0, resolved: 0, critical: 0, high: 0, medium: 0, low: 0, score: 100 };
  let deduction = 0;
  for (const issue of issues) {
    if (issue.status === "resolved") summary.resolved += 1;
    else {
      summary.open += 1;
      if (Object.hasOwn(WEIGHTS, issue.severity)) {
        summary[issue.severity] += 1;
        deduction += WEIGHTS[issue.severity];
      }
    }
  }
  summary.score = Math.max(0, 100 - deduction);
  return Object.freeze(summary);
}

export function loadFixtureRecord({ build = "broken", viewport = "mobile-390" } = {}) {
  if (!Object.hasOwn(VIEWPORTS, viewport)) throw new RangeError("Unknown simulated viewport");
  if (!new Set(["broken", "fixed"]).has(build)) throw new RangeError("Unknown fixture build");

  const selected = BLUEPRINTS.filter((issue) => issue.viewports.includes(viewport));
  const issues = selected.map((issue) => Object.freeze({
    id: issue.id,
    title: issue.title,
    category: issue.category,
    severity: issue.severity,
    selector: issue.selector,
    viewport,
    status: build === "fixed" ? "resolved" : "open",
    repro: [...issue.repro],
    expected: issue.expected,
    actual: build === "fixed" ? issue.resolvedActual : issue.actual,
    evidencePhase: build === "fixed" ? "retest" : "observed",
    evidence: build === "fixed" ? issue.resolvedEvidence : issue.observedEvidence
  }));

  return Object.freeze({
    fixture: "Northstar Store / QA fixture",
    build,
    viewport: Object.freeze({ ...VIEWPORTS[viewport], simulated: true }),
    issues: Object.freeze(issues),
    summary: summarizeIssues(issues),
    externalWrites: false,
    disclaimer: "All findings are seeded fixture records. Viewport values are deterministic simulations, not measurements from a storefront, browser matrix, or physical device."
  });
}

export function loadFixtureWorkspace({ build = "broken", viewport = "mobile-390" } = {}) {
  const selected = loadFixtureRecord({ build, viewport });
  const observed = build === "broken" ? selected : loadFixtureRecord({ build: "broken", viewport });
  const retest = build === "fixed" ? selected : loadFixtureRecord({ build: "fixed", viewport });

  return Object.freeze({
    selected,
    comparison: Object.freeze({ observed, retest })
  });
}

export function filterIssues(issues = [], severity = "all") {
  if (severity === "all") return [...issues];
  return issues.filter((issue) => issue.severity === severity);
}

export function buildQaReport(record, { projectName = "Northstar Store", generatedAt = new Date().toISOString() } = {}) {
  if (!record?.viewport?.simulated || !Array.isArray(record?.issues)) throw new TypeError("A LaunchLens fixture record is required");
  return Object.freeze({
    schemaVersion: 1,
    recordType: "seeded-simulation",
    project: cleanText(projectName, 80) || "Untitled fixture",
    generatedAt: cleanText(generatedAt, 40),
    source: "LaunchLens seeded QA fixture record",
    build: record.build,
    viewport: { id: record.viewport.id, width: record.viewport.width, height: record.viewport.height, simulated: true },
    summary: { ...record.summary },
    issues: record.issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      severity: issue.severity,
      category: issue.category,
      status: issue.status,
      selector: issue.selector,
      repro: [...issue.repro],
      expected: issue.expected,
      actual: issue.actual,
      evidencePhase: issue.evidencePhase,
      evidence: issue.evidence
    })),
    disclaimer: record.disclaimer,
    externalWrites: false
  });
}

export function serializeQaReport(report) {
  if (!report || report.schemaVersion !== 1) throw new TypeError("A valid QA report is required");
  return `${JSON.stringify(report, null, 2)}\n`;
}
