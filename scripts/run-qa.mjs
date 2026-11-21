#!/usr/bin/env node
/**
 * Local/staging QA entrypoint. Never targets production.
 * Usage: npm run test:qa
 * Full multi-viewport regression: TEST_QA_FULL=1 npm run test:qa
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsDir = path.join(root, "qa-reports");
mkdirSync(reportsDir, { recursive: true });

function run(cmd, args, opts = {}) {
  console.log(`\n› ${cmd} ${args.join(" ")}\n`);
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...opts.env },
    shell: process.platform === "win32",
  });
  return result.status ?? 1;
}

const started = new Date().toISOString();
const results = {
  startedAt: started,
  unit: null,
  e2e: null,
  build: null,
};

results.build = run("npm", ["run", "build"]);
if (results.build !== 0) {
  writeFailure("Build failed — e2e skipped.");
  process.exit(results.build);
}

results.unit = run("npx", ["vitest", "run"]);
const full = process.env.TEST_QA_FULL === "1";
const e2eArgs = full
  ? ["playwright", "test"]
  : [
      "playwright",
      "test",
      "--project=desktop-chrome",
      "e2e/journey-a-new-student.spec.ts",
      "e2e/journey-b-returning.spec.ts",
      "e2e/journey-c-pronunciation.spec.ts",
      "e2e/journey-e-english.spec.ts",
      "e2e/smoke-routes.spec.ts",
      "e2e/journey-d-karaoke.spec.ts",
    ];

results.e2e = run("npx", e2eArgs);
results.finishedAt = new Date().toISOString();

const reportGen = run("node", ["scripts/qa-report.mjs"]);
const code = results.unit !== 0 || results.e2e !== 0 || reportGen !== 0 ? 1 : 0;
process.exit(code);

function writeFailure(message) {
  writeFileSync(
    path.join(reportsDir, "latest-summary.md"),
    `# QA run failed\n\n${message}\n\nStarted: ${started}\n`,
  );
}
