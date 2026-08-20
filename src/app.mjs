import { VIEWPORTS, buildQaReport, filterIssues, scanFixture, serializeQaReport } from "./domain.mjs";

const elements = {
  build: document.querySelector("#build-select"),
  viewport: document.querySelector("#viewport-select"),
  scan: document.querySelector("#run-scan"),
  retest: document.querySelector("#retest-fixed"),
  export: document.querySelector("#export-report"),
  filter: document.querySelector("#severity-filter"),
  status: document.querySelector("#scan-status"),
  metrics: document.querySelector("#metrics"),
  mobileScore: document.querySelector("#mobile-score"),
  mobileFindings: document.querySelector("#mobile-findings"),
  mobileSeverity: document.querySelector("#mobile-severity"),
  issueList: document.querySelector("#issue-list"),
  issueCount: document.querySelector("#issue-count"),
  detail: document.querySelector("#issue-detail"),
  preview: document.querySelector("#fixture-preview"),
  decisionNote: document.querySelector("#decision-note"),
  toast: document.querySelector("#toast")
};

let state = {
  scan: scanFixture({ build: "broken", viewport: "mobile-390" }),
  selectedId: "broken-pricing-link",
  filter: "all"
};

for (const viewport of Object.values(VIEWPORTS)) {
  const option = document.createElement("option");
  option.value = viewport.id;
  option.textContent = `${viewport.label} · simulated`;
  elements.viewport.append(option);
}
elements.viewport.value = state.scan.viewport.id;

function labelSeverity(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function displayText(value) {
  return String(value ?? "").replace(/\bfixture\b/gi, "test build");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 2600);
}

function renderMetrics() {
  const { summary } = state.scan;
  const cards = [
    ["Release score", `${summary.score}/100`, summary.score === 100 ? "Ready for handoff" : "Needs review"],
    ["Open findings", String(summary.open), `${summary.high} high · ${summary.medium} medium`],
    ["Viewport", `${state.scan.viewport.width} px`, "Simulated width"],
    ["Evidence fields", "4", "Repro · expected · actual · trace"]
  ];
  elements.metrics.replaceChildren(...cards.map(([label, value, meta]) => {
    const card = document.createElement("article");
    card.className = "report-stat";
    const p = document.createElement("p");
    p.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    const small = document.createElement("small");
    small.textContent = meta;
    card.append(p, strong, small);
    return card;
  }));
  if (elements.mobileScore) elements.mobileScore.textContent = `${summary.score}/100`;
  if (elements.mobileFindings) elements.mobileFindings.textContent = String(summary.open);
  if (elements.mobileSeverity) {
    elements.mobileSeverity.textContent = summary.open
      ? `${summary.high} high · ${summary.medium} medium · ${summary.low} low`
      : `${summary.resolved} findings resolved in retest`;
  }
}

function renderIssues() {
  const visible = filterIssues(state.scan.issues, state.filter);
  if (!visible.some((issue) => issue.id === state.selectedId)) state.selectedId = visible[0]?.id ?? "";
  elements.issueCount.textContent = `${visible.length} shown`;
  elements.issueList.replaceChildren(...visible.map((issue) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "issue-row";
    button.dataset.active = String(issue.id === state.selectedId);
    button.setAttribute("aria-pressed", String(issue.id === state.selectedId));
    const number = document.createElement("span");
    number.className = "issue-number";
    number.textContent = `LL-${String(state.scan.issues.findIndex((item) => item.id === issue.id) + 1).padStart(3, "0")}`;
    const copy = document.createElement("span");
    copy.className = "issue-copy";
    const title = document.createElement("strong");
    title.textContent = issue.title;
    const meta = document.createElement("small");
    meta.textContent = `${issue.category} · ${issue.selector}`;
    copy.append(title, meta);
    const badge = document.createElement("span");
    badge.className = `severity severity-${issue.status === "resolved" ? "resolved" : issue.severity}`;
    badge.textContent = issue.status === "resolved" ? "Resolved" : labelSeverity(issue.severity);
    button.append(number, copy, badge);
    button.addEventListener("click", () => {
      state.selectedId = issue.id;
      renderIssues();
      renderDetail();
    });
    return button;
  }));
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No findings match this severity filter.";
    elements.issueList.append(empty);
  }
}

function detailBlock(label, value) {
  const block = document.createElement("div");
  block.className = "detail-block";
  const heading = document.createElement("h4");
  heading.textContent = label;
  const body = document.createElement("p");
  body.textContent = displayText(value);
  block.append(heading, body);
  return block;
}

function renderDetail() {
  const issue = state.scan.issues.find((item) => item.id === state.selectedId);
  elements.detail.replaceChildren();
  if (!issue) {
    elements.detail.className = "detail empty-state";
    elements.detail.textContent = "Select a finding to inspect its evidence.";
    return;
  }
  elements.detail.className = "detail";
  const top = document.createElement("div");
  top.className = "detail-top";
  const kicker = document.createElement("span");
  kicker.textContent = `${issue.severity} severity / ${issue.status}`;
  const title = document.createElement("h3");
  title.textContent = issue.title;
  top.append(kicker, title);
  const steps = document.createElement("ol");
  steps.className = "repro-list";
  for (const step of issue.repro) {
    const item = document.createElement("li");
    item.textContent = displayText(step);
    steps.append(item);
  }
  const stepBlock = document.createElement("div");
  stepBlock.className = "detail-block";
  const stepTitle = document.createElement("h4");
  stepTitle.textContent = "Reproduction";
  stepBlock.append(stepTitle, steps);
  const evidence = document.createElement("code");
  evidence.textContent = displayText(issue.evidence);
  const evidenceBlock = document.createElement("div");
  evidenceBlock.className = "detail-block evidence";
  const evidenceTitle = document.createElement("h4");
  evidenceTitle.textContent = "Evidence";
  evidenceBlock.append(evidenceTitle, evidence);
  elements.detail.append(top, stepBlock, detailBlock("Expected", issue.expected), detailBlock("Actual", issue.actual), evidenceBlock);
}

function renderPreview() {
  const fixed = state.scan.build === "fixed";
  elements.preview.dataset.build = state.scan.build;
  elements.preview.style.setProperty("--fixture-width", `${Math.min(state.scan.viewport.width, 520)}px`);
  elements.preview.querySelector("[data-preview-build]").textContent = fixed ? "Retest build 1.4.3" : "Observed build 1.4.2";
  elements.preview.querySelector("[data-preview-state]").textContent = fixed ? "all findings resolved" : "5 findings open";
  elements.preview.querySelector("[data-preview-link]").textContent = fixed ? "/pricing · 200" : "/pricing-legacy · 404";
  elements.preview.querySelector("[data-preview-form]").textContent = fixed ? "Validates input + labelled field" : "Accepts hello@ + missing label";
}

function render() {
  elements.build.value = state.scan.build;
  elements.viewport.value = state.scan.viewport.id;
  elements.filter.value = state.filter;
  elements.status.textContent = state.scan.build === "fixed" ? "PASS · READY" : "HOLD · 5 OPEN";
  elements.status.dataset.pass = String(state.scan.build === "fixed");
  elements.decisionNote.textContent = state.scan.build === "fixed" ? "Retest evidence supports release handoff" : "Evidence review required before handoff";
  renderMetrics();
  renderIssues();
  renderDetail();
  renderPreview();
}

function runScan(build = elements.build.value) {
  state.scan = scanFixture({ build, viewport: elements.viewport.value });
  state.selectedId = state.scan.issues[0]?.id ?? "";
  render();
  showToast(build === "fixed" ? "Fixed build retested locally." : "Observed build checked locally.");
}

elements.scan.addEventListener("click", () => runScan());
elements.retest.addEventListener("click", () => {
  elements.build.value = "fixed";
  runScan("fixed");
});
elements.build.addEventListener("change", () => runScan());
elements.viewport.addEventListener("change", () => runScan());
elements.filter.addEventListener("change", () => {
  state.filter = elements.filter.value;
  renderIssues();
  renderDetail();
});
elements.export.addEventListener("click", () => {
  const report = buildQaReport(state.scan);
  const blob = new Blob([serializeQaReport(report)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `launchlens-${state.scan.build}-${state.scan.viewport.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Local JSON report prepared. No data was sent.");
});

render();
