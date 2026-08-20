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
    actual: "The fixture returns a 404 response for /pricing-legacy.",
    resolvedActual: "The link now targets /pricing and returns the fixture success page.",
    evidence: "Fixture route check: GET /pricing-legacy → 404"
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
    actual: "The broken fixture shows a success message.",
    resolvedActual: "Invalid input is rejected and the field receives an inline error.",
    evidence: "Fixture assertion: invalid payload returned success=true"
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
    actual: "The accessible name is empty in the broken fixture.",
    resolvedActual: "A visible label is associated with the input by id.",
    evidence: "Fixture accessibility tree: textbox name='(empty)'"
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
    actual: "The fixture row is 46 px wider than its simulated viewport.",
    resolvedActual: "The row wraps and its measured width stays within the viewport.",
    evidence: "Fixture geometry: scrollWidth 436 px > clientWidth 390 px"
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
    actual: "Two fixture elements use id='newsletter-email'.",
    resolvedActual: "Each control now has a unique id.",
    evidence: "Fixture DOM rule: duplicate-id count=2"
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

export function scanFixture({ build = "broken", viewport = "mobile-390" } = {}) {
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
    evidence: build === "fixed" ? `Retest passed — ${issue.evidence}` : issue.evidence
  }));

  return Object.freeze({
    fixture: "Northstar Store / QA fixture",
    build,
    viewport: Object.freeze({ ...VIEWPORTS[viewport], simulated: true }),
    issues: Object.freeze(issues),
    summary: summarizeIssues(issues),
    externalWrites: false,
    disclaimer: "Viewport checks are deterministic simulations, not tests on real Safari, iOS, Android, or physical devices."
  });
}

export function filterIssues(issues = [], severity = "all") {
  if (severity === "all") return [...issues];
  return issues.filter((issue) => issue.severity === severity);
}

export function buildQaReport(scan, { projectName = "Northstar Store", generatedAt = new Date().toISOString() } = {}) {
  if (!scan?.viewport?.simulated || !Array.isArray(scan?.issues)) throw new TypeError("A LaunchLens scan is required");
  return Object.freeze({
    schemaVersion: 1,
    project: cleanText(projectName, 80) || "Untitled fixture",
    generatedAt: cleanText(generatedAt, 40),
    source: "LaunchLens QA evidence fixture",
    build: scan.build,
    viewport: { id: scan.viewport.id, width: scan.viewport.width, height: scan.viewport.height, simulated: true },
    summary: { ...scan.summary },
    issues: scan.issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      severity: issue.severity,
      category: issue.category,
      status: issue.status,
      selector: issue.selector,
      repro: [...issue.repro],
      expected: issue.expected,
      actual: issue.actual,
      evidence: issue.evidence
    })),
    disclaimer: scan.disclaimer,
    externalWrites: false
  });
}

export function serializeQaReport(report) {
  if (!report || report.schemaVersion !== 1) throw new TypeError("A valid QA report is required");
  return `${JSON.stringify(report, null, 2)}\n`;
}
