#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsDir = path.join(root, "qa-reports");
mkdirSync(reportsDir, { recursive: true });

const jsonPath = path.join(reportsDir, "playwright-results.json");
let pw = null;
if (existsSync(jsonPath)) {
  try {
    pw = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch {
    pw = null;
  }
}

function countSuites(suite, acc = { total: 0, passed: 0, failed: 0, skipped: 0 }) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      acc.total += 1;
      const result = t.results?.[t.results.length - 1];
      const status = result?.status ?? t.status;
      if (status === "passed" || status === "expected") acc.passed += 1;
      else if (status === "skipped") acc.skipped += 1;
      else acc.failed += 1;
    }
  }
  for (const child of suite.suites ?? []) countSuites(child, acc);
  return acc;
}

const stats = pw?.suites
  ? pw.suites.reduce((acc, s) => countSuites(s, acc), {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    })
  : { total: 0, passed: 0, failed: 0, skipped: 0 };

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const uncovered = [
  "Real Azure vi-VN / en-US pronunciation accuracy (manual + native-speaker review)",
  "True WebKit Safari binary (host deps) — iPhone viewport uses Chromium sizing",
  "Scan OCR with live camera / Vision APIs",
  "Supabase cloud sync (if configured)",
  "Destructive admin karaoke align pipelines against production media",
  "Paid OpenAI teacher/translate live calls (mocked in routine e2e)",
  "Full 149-lesson path completion marathon",
];

const bugsFixed = [
  "English `/api/english/assess|teacher|translate` rate limits now keyed per viewer (was shared global bucket).",
  "English `/api/english/status` now requires identity (was unauthenticated capability probe).",
];

const remaining = [
  "Bind `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` for live pronunciation scoring validation.",
  "Native-speaker review of Azure score reasonableness (Phase 5 of pronunciation brief).",
  "Optional: install Playwright WebKit system deps for true Safari engine runs.",
];

const md = `# QA Report — ÁMi Lingua

Generated: ${new Date().toISOString()}

## Playwright (this run)

| Metric | Count |
|--------|------:|
| Total | ${stats.total} |
| Passed | ${stats.passed} |
| Failed | ${stats.failed} |
| Skipped | ${stats.skipped} |

Artifacts: \`qa-reports/playwright-html/\`, \`qa-reports/test-results/\` (screenshots/traces on failure).

## Unit / integration (Vitest)

Run via \`npm test\` as part of \`npm run test:qa\`. See terminal output for pass/fail counts.

## Feature coverage (automated)

- Journey A — New student (welcome → onboarding → Foundations lesson → XP → refresh)
- Journey B — Returning student (seeded XP, resume next lesson)
- Journey C — Pronunciation UX with **mocked** assess responses
- Journey D — Karaoke fixture timestamp sync + player smoke
- Journey E — English welcome / home / speak smoke
- Route smoke list (home, Đánh Vần, hear-write, progress, settings, sing, studio, vocab)

## Features not covered / manual

${uncovered.map((x) => `- ${x}`).join("\n")}

## Bugs fixed in this QA pass

${bugsFixed.map((x) => `- ${x}`).join("\n")}

## Remaining issues

${remaining.map((x) => `- ${x}`).join("\n")}

## Recommendations

1. Keep \`npm run test:qa\` on PRs (unit + critical desktop Playwright).
2. Run \`TEST_QA_FULL=1 npm run test:qa\` before release (all viewports).
3. Never point Playwright at production with seed scripts.
4. Treat mocked pronunciation scores as wiring tests only — not accuracy claims.

## Commands

\`\`\`bash
npm run test:qa
TEST_QA_FULL=1 npm run test:qa
npx playwright show-report qa-reports/playwright-html
\`\`\`
`;

writeFileSync(path.join(reportsDir, "latest-summary.md"), md);
writeFileSync(path.join(reportsDir, `report-${stamp}.md`), md);
console.log(`Wrote ${path.join(reportsDir, "latest-summary.md")}`);
