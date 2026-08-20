import test from "node:test";
import assert from "node:assert/strict";
import { buildQaReport, filterIssues, scanFixture, serializeQaReport, summarizeIssues } from "../src/domain.mjs";

test("broken mobile fixture exposes the deterministic five-issue set", () => {
  const result = scanFixture({ build: "broken", viewport: "mobile-390" });
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
  const result = scanFixture({ build: "broken", viewport: "desktop-1440" });
  assert.equal(result.issues.length, 4);
  assert.equal(result.issues.some((item) => item.id === "promo-row-overflow"), false);
});

test("broken build summary applies deterministic severity weights", () => {
  const result = scanFixture({ build: "broken", viewport: "mobile-390" });
  assert.deepEqual(result.summary, { total: 5, open: 5, resolved: 0, critical: 0, high: 2, medium: 2, low: 1, score: 51 });
});

test("fixed-build retest resolves every finding and restores the score", () => {
  const result = scanFixture({ build: "fixed", viewport: "mobile-390" });
  assert.equal(result.issues.every((item) => item.status === "resolved"), true);
  assert.equal(result.summary.resolved, 5);
  assert.equal(result.summary.score, 100);
});

test("every issue contains reproducible QA evidence", () => {
  const result = scanFixture();
  for (const issue of result.issues) {
    assert.ok(issue.repro.length >= 2);
    assert.ok(issue.expected.length > 10);
    assert.ok(issue.actual.length > 10);
    assert.ok(issue.evidence.length > 10);
  }
});

test("severity filter is non-mutating and exact", () => {
  const source = scanFixture().issues;
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
  assert.throws(() => scanFixture({ build: "production" }), /Unknown fixture build/);
  assert.throws(() => scanFixture({ viewport: "real-iphone" }), /Unknown simulated viewport/);
});

test("report keeps the simulation and no-write boundaries explicit", () => {
  const scan = scanFixture({ build: "broken", viewport: "mobile-412" });
  const report = buildQaReport(scan, { projectName: " Northstar\u0000 Store ", generatedAt: "2026-08-19T12:00:00.000Z" });
  assert.equal(report.project, "Northstar Store");
  assert.equal(report.viewport.simulated, true);
  assert.equal(report.externalWrites, false);
  assert.match(report.disclaimer, /not tests on real Safari, iOS, Android/);
});

test("serialized report is parseable JSON with the full issue evidence", () => {
  const report = buildQaReport(scanFixture(), { generatedAt: "2026-08-19T12:00:00.000Z" });
  const serialized = serializeQaReport(report);
  const parsed = JSON.parse(serialized);
  assert.equal(serialized.endsWith("\n"), true);
  assert.equal(parsed.issues.length, 5);
  assert.equal(parsed.issues[0].repro.length, 2);
});
