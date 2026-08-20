import { expect, test } from "@playwright/test";

const selectFinding = async (page, title) => {
  await page.getByRole("button", { name: new RegExp(title, "i") }).click();
};

const expectStableComparison = async (page) => {
  const observed = page.getByRole("region", { name: "Observed fixture record 1.4.2", exact: true });
  const retest = page.getByRole("region", { name: "Retest fixture record 1.4.3", exact: true });

  await expect(observed).toBeVisible();
  await expect(observed).toContainText("5 findings open");
  await expect(observed).toContainText("/pricing-legacy · 404");
  await expect(observed).toContainText("Accepts hello@ + missing label");
  await expect(observed).not.toContainText("Retest fixture record 1.4.3");
  await expect(retest).toBeVisible();
  await expect(retest).toContainText("5 findings resolved");
  await expect(retest).toContainText("/pricing · 200");
  await expect(retest).toContainText("Validated + labelled");
  await expect(retest).not.toContainText("/pricing-legacy");
  await expect(retest).not.toContainText("404");

  return Promise.all([observed.textContent(), retest.textContent()]);
};

const expectNoPageOverflow = async (page) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
};

test("observed and retest UI records remain explicitly seeded and consistent", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/Seeded fixture records only/)).toBeVisible();
  await expect(page.getByLabel("Recorded build")).toHaveValue("broken");
  await expect(page.locator("#scan-status")).toHaveText("FIXTURE HOLD · 5 OPEN");
  await expect(page.locator("#issue-detail")).toHaveAttribute("data-status", "open");
  await expect(page.getByRole("heading", { name: "Observed fixture record" })).toBeVisible();
  await expect(page.getByLabel("Observed fixture record", { exact: true })).toHaveText("Fixture record (observed): pricing target=/pricing-legacy; recorded outcome=404");
  await expect(page.locator("#issue-detail")).toContainText("seeded 1.4.2 record marks /pricing-legacy as a 404 outcome");
  await expect(page.locator("#fixture-preview")).toHaveAttribute("data-selected-build", "broken");
  const comparisonBefore = await expectStableComparison(page);
  if (process.env.CAPTURE_PROOF) await page.waitForTimeout(1_200);

  await page.getByRole("button", { name: /Open fixed-build record/ }).click();

  await expect(page.locator("#scan-status")).toHaveText("FIXTURE · PASS");
  await expect(page.locator("#decision-note")).toHaveText("Recorded comparison reaches the fixture pass state");
  await expect(page.locator("#issue-count")).toHaveText("5 shown · 5 resolved");
  await expect(page.locator(".severity-resolved")).toHaveCount(5);
  await expect(page.locator("#issue-detail")).toHaveAttribute("data-status", "resolved");
  await expect(page.getByRole("heading", { name: "Recorded retest result" })).toBeVisible();
  await expect(page.getByLabel("Recorded retest result")).toHaveText("Fixture record (retest): pricing target=/pricing; recorded outcome=200");
  await expect(page.getByLabel("Recorded retest result")).not.toContainText("/pricing-legacy");
  await expect(page.getByLabel("Recorded retest result")).not.toContainText("outcome=404");
  await expect(page.locator("#issue-detail")).toContainText("seeded 1.4.3 retest record marks /pricing as a 200 outcome");
  await expect(page.locator("#issue-detail")).not.toContainText("404");
  await expect(page.locator("#fixture-preview")).toHaveAttribute("data-selected-build", "fixed");
  expect(await expectStableComparison(page)).toEqual(comparisonBefore);
  if (process.env.CAPTURE_PROOF) await page.waitForTimeout(1_200);

  await selectFinding(page, "Signup accepts an invalid email address");
  await expect(page.getByLabel("Recorded retest result")).toHaveText("Fixture record (retest): input=hello@; recorded outcome=rejected; inline error=present");
  await expect(page.getByLabel("Recorded retest result")).not.toContainText("outcome=accepted");
  await expect(page.locator("#issue-detail")).toContainText("seeded 1.4.3 retest record marks hello@ as rejected");
  if (process.env.CAPTURE_PROOF) await page.waitForTimeout(700);

  await selectFinding(page, "Newsletter field has no programmatic label");
  await expect(page.getByLabel("Recorded retest result")).toHaveText("Fixture record (retest): recorded accessible name='Email'");
  await expect(page.getByLabel("Recorded retest result")).not.toContainText("name='(empty)'");
  await expect(page.locator("#issue-detail")).toContainText("seeded 1.4.3 retest record gives the newsletter field the name Email");
  if (process.env.CAPTURE_PROOF) await page.waitForTimeout(900);
});

test("release room remains legible and horizontally contained", async ({ page }, testInfo) => {
  await page.goto("/");
  await expectNoPageOverflow(page);
  const comparisonBefore = await expectStableComparison(page);

  await expect(page.locator("#workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: "Load recorded state" })).toBeVisible();
  await expect(page.locator("#issue-list")).toBeVisible();
  await expect(page.locator("#issue-detail")).toBeVisible();

  const source = page.getByRole("link", { name: "Source", exact: true });
  const ci = page.getByRole("link", { name: "CI", exact: true });
  await expect(source).toHaveAttribute("href", "https://github.com/x3r3S/launchlens-release-qa");
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(ci).toHaveAttribute("href", "https://github.com/x3r3S/launchlens-release-qa/actions");
  await expect(ci).toHaveAttribute("target", "_blank");

  await page.screenshot({
    path: testInfo.outputPath(`launchlens-${testInfo.project.name}-observed.png`),
    fullPage: true
  });

  await page.getByRole("button", { name: /Open fixed-build record/ }).click();
  const retestButton = page.getByRole("button", { name: "Retest record loaded · build 1.4.3" });
  await expect(retestButton).toBeDisabled();
  expect(await expectStableComparison(page)).toEqual(comparisonBefore);
  await expect(page.locator("#issue-detail")).not.toContainText("404");
  await expectNoPageOverflow(page);
  await expect(page.locator("#toast")).toBeHidden({ timeout: 4_000 });

  await page.screenshot({
    path: testInfo.outputPath(`launchlens-${testInfo.project.name}-fixed.png`),
    fullPage: true
  });
});
