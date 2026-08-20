import test from "node:test";
import assert from "node:assert/strict";
import { buildQaReport, filterIssues, loadFixtureRecord, loadFixtureWorkspace, serializeQaReport, summarizeIssues } from "../src/domain.mjs";

test("broken mobile fixture exposes the deterministic five-issue set", () => {
  const result = loadFixtureRecord({ build: "broken", viewport: "mobile-390" });
  assert.equal(result.issues.length, 5);
  assert.deepEqual(result.issues.map((item) => item.id), [
    "broken-pricing-link",
    "invalid-email-accepted",
    "email-label-missing",
    "promo-row-overflow",
    "duplicate-newsletter-id"
  ]);
});

test("desktop scan excludes the narrow-viewport overflow finding", () => {
  const result = loadFixtureRecord({ build: "broken", viewport: "desktop-1440" });
  assert.equal(result.issues.length, 4);
  assert.equal(result.issues.some((item) => item.id === "promo-row-overflow"), false);
});

test("broken build summary applies deterministic severity weights", () => {
  const result = loadFixtureRecord({ build: "broken", viewport: "mobile-390" });
  assert.deepEqual(result.summary, { total: 5, open: 5, resolved: 0, critical: 0, high: 2, medium: 2, low: 1, score: 51 });
});

test("fixed-build retest resolves every finding and restores the score", () => {
  const result = loadFixtureRecord({ build: "fixed", viewport: "mobile-390" });
  assert.equal(result.issues.every((item) => item.status === "resolved"), true);
  assert.equal(result.issues.every((item) => item.evidencePhase === "retest"), true);
  assert.equal(result.summary.resolved, 5);
  assert.equal(result.summary.score, 100);
});

test("fixed record uses exact seeded retest wording without stale observed values", () => {
  const issues = new Map(loadFixtureRecord({ build: "fixed", viewport: "mobile-390" }).issues.map((issue) => [issue.id, issue]));

  assert.equal(issues.get("broken-pricing-link").evidence, "Fixture record (retest): pricing target=/pricing; recorded outcome=200");
  assert.equal(issues.get("invalid-email-accepted").evidence, "Fixture record (retest): input=hello@; recorded outcome=rejected; inline error=present");
  assert.equal(issues.get("email-label-missing").evidence, "Fixture record (retest): recorded accessible name='Email'");
  assert.equal(issues.get("promo-row-overflow").evidence, "Simulated fixture record (retest): row=390 px; viewport=390 px; overflow=0; wrap=enabled");
  assert.equal(issues.get("duplicate-newsletter-id").evidence, "Fixture record (retest): recorded duplicate newsletter-email id count=0");

  for (const issue of issues.values()) {
    assert.match(issue.evidence, /fixture record \(retest\)/i);
    assert.doesNotMatch(issue.evidence, /recorded outcome=404|outcome=accepted|name='\(empty\)'|overflow=46|count=2/);
  }
});

test("observed record retains exact seeded observed wording", () => {
  const issues = new Map(loadFixtureRecord({ build: "broken", viewport: "mobile-390" }).issues.map((issue) => [issue.id, issue]));
  assert.equal(issues.get("broken-pricing-link").evidencePhase, "observed");
  assert.equal(issues.get("broken-pricing-link").evidence, "Fixture record (observed): pricing target=/pricing-legacy; recorded outcome=404");
  assert.equal(issues.get("invalid-email-accepted").evidence, "Fixture record (observed): input=hello@; recorded outcome=accepted");
  assert.equal(issues.get("email-label-missing").evidence, "Fixture record (observed): recorded accessible name='(empty)'");
});

test("selected build never replaces the stable observed and retest comparison", () => {
  const observedSelection = loadFixtureWorkspace({ build: "broken", viewport: "mobile-390" });
  const fixedSelection = loadFixtureWorkspace({ build: "fixed", viewport: "mobile-390" });

  assert.equal(observedSelection.selected, observedSelection.comparison.observed);
  assert.equal(fixedSelection.selected, fixedSelection.comparison.retest);
  assert.deepEqual(observedSelection.comparison, fixedSelection.comparison);
  assert.equal(fixedSelection.comparison.observed.build, "broken");
  assert.equal(fixedSelection.comparison.observed.summary.open, 5);
  assert.match(fixedSelection.comparison.observed.issues[0].evidence, /pricing-legacy; recorded outcome=404/);
  assert.equal(fixedSelection.comparison.retest.build, "fixed");
  assert.equal(fixedSelection.comparison.retest.summary.resolved, 5);
  assert.match(fixedSelection.comparison.retest.issues[0].evidence, /pricing; recorded outcome=200/);
  assert.doesNotMatch(fixedSelection.comparison.retest.issues[0].evidence, /404/);
});

test("every finding contains complete seeded record fields", () => {
  const result = loadFixtureRecord();
  for (const issue of result.issues) {
    assert.ok(issue.repro.length >= 2);
    assert.ok(issue.expected.length > 10);
    assert.ok(issue.actual.length > 10);
    assert.ok(["observed", "retest"].includes(issue.evidencePhase));
    assert.ok(issue.evidence.length > 10);
  }
});

test("severity filter is non-mutating and exact", () => {
  const source = loadFixtureRecord().issues;
  const high = filterIssues(source, "high");
  assert.equal(high.length, 2);
  assert.equal(high.every((item) => item.severity === "high"), true);
  assert.equal(source.length, 5);
});

test("summary does not deduct resolved findings", () => {
  const summary = summarizeIssues([
    { status: "resolved", severity: "high" },
    { status: "open", severity: "low" }
  ]);
  assert.equal(summary.score, 97);
  assert.equal(summary.open, 1);
});

test("unknown builds and viewports fail closed", () => {
  assert.throws(() => loadFixtureRecord({ build: "production" }), /Unknown fixture build/);
  assert.throws(() => loadFixtureRecord({ viewport: "real-iphone" }), /Unknown simulated viewport/);
});

test("report keeps the simulation and no-write boundaries explicit", () => {
  const record = loadFixtureRecord({ build: "broken", viewport: "mobile-412" });
  const report = buildQaReport(record, { projectName: " Northstar\u0000 Store ", generatedAt: "2026-08-19T12:00:00.000Z" });
  assert.equal(report.project, "Northstar Store");
  assert.equal(report.recordType, "seeded-simulation");
  assert.equal(report.viewport.simulated, true);
  assert.equal(report.externalWrites, false);
  assert.match(report.disclaimer, /seeded fixture records/);
  assert.match(report.disclaimer, /not measurements from a storefront/);
});

test("serialized report is parseable JSON with the full seeded record", () => {
  const report = buildQaReport(loadFixtureRecord(), { generatedAt: "2026-08-19T12:00:00.000Z" });
  const serialized = serializeQaReport(report);
  const parsed = JSON.parse(serialized);
  assert.equal(serialized.endsWith("\n"), true);
  assert.equal(parsed.issues.length, 5);
  assert.equal(parsed.issues[0].repro.length, 2);
  assert.equal(parsed.issues[0].evidencePhase, "observed");
  assert.equal(parsed.recordType, "seeded-simulation");
});
