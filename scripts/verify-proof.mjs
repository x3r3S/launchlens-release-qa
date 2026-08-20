import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scanFixture } from "../src/domain.mjs";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const [bugReport, retestReport] = await Promise.all([
  readFile(join(projectRoot, "evidence", "LL-001-pricing-link.md"), "utf8"),
  readFile(join(projectRoot, "evidence", "retest-1.4.3.md"), "utf8")
]);
const plainMarkdown = (value) => value.replaceAll("`", "").replaceAll("*", "");
const bugReportText = plainMarkdown(bugReport);
const retestReportText = plainMarkdown(retestReport);

const broken = scanFixture({ build: "broken", viewport: "mobile-390" });
const fixed = scanFixture({ build: "fixed", viewport: "mobile-390" });
const pricingBefore = broken.issues.find((issue) => issue.id === "broken-pricing-link");
const pricingAfter = fixed.issues.find((issue) => issue.id === "broken-pricing-link");

assert.ok(pricingBefore, "pricing finding is missing from the broken fixture");
assert.ok(pricingAfter, "pricing finding is missing from the fixed fixture");

for (const value of [
  pricingBefore.title,
  pricingBefore.category,
  pricingBefore.selector,
  pricingBefore.expected,
  pricingBefore.actual,
  pricingBefore.evidence,
  pricingAfter.actual
]) {
  assert.ok(bugReportText.includes(value), `bug report is missing current domain value: ${value}`);
}

for (const step of pricingBefore.repro) {
  assert.ok(bugReportText.includes(step), `bug report is missing reproduction step: ${step}`);
}

const summaryClaims = [
  `${broken.summary.score}/100`,
  `${fixed.summary.score}/100`,
  `| Open findings | ${broken.summary.open} | ${fixed.summary.open} |`,
  `| Resolved findings | ${broken.summary.resolved} | ${fixed.summary.resolved} |`,
  `| High | ${broken.summary.high} | ${fixed.summary.high} |`,
  `| Medium | ${broken.summary.medium} | ${fixed.summary.medium} |`,
  `| Low | ${broken.summary.low} | ${fixed.summary.low} |`
];

for (const claim of summaryClaims) {
  assert.ok(retestReportText.includes(claim), `retest report is missing current summary value: ${claim}`);
}

for (const issue of fixed.issues) {
  assert.ok(retestReportText.includes(issue.actual), `retest report is missing corrected result: ${issue.actual}`);
}

console.log("Proof pack matches the current Mobile 390 fixture and fixed-build retest.");
