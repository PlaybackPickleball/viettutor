# QA Report — ÁMi Lingua

Generated: 2026-11-21T07:52:21.015Z

## Playwright (this run)

| Metric | Count |
|--------|------:|
| Total | 17 |
| Passed | 17 |
| Failed | 0 |
| Skipped | 0 |

Artifacts: `qa-reports/playwright-html/`, `qa-reports/test-results/` (screenshots/traces on failure).

## Unit / integration (Vitest)

**117 passed / 0 failed** (29 files) in the companion `npm run test:unit` run for this report.

## Feature coverage (automated)

- Journey A — New student (welcome → onboarding → Foundations lesson → XP → refresh)
- Journey B — Returning student (seeded XP, resume next lesson)
- Journey C — Pronunciation UX with **mocked** assess responses
- Journey D — Karaoke fixture timestamp sync + player smoke
- Journey E — English welcome / home / speak smoke
- Route smoke list (home, Đánh Vần, hear-write, progress, settings, sing, studio, vocab)

## Features not covered / manual

- Real Azure vi-VN / en-US pronunciation accuracy (manual + native-speaker review)
- True WebKit Safari binary (host deps) — iPhone viewport uses Chromium sizing
- Scan OCR with live camera / Vision APIs
- Supabase cloud sync (if configured)
- Destructive admin karaoke align pipelines against production media
- Paid OpenAI teacher/translate live calls (mocked in routine e2e)
- Full 149-lesson path completion marathon

## Bugs fixed in this QA pass

- English `/api/english/assess|teacher|translate` rate limits now keyed per viewer (was shared global bucket).
- English `/api/english/status` now requires identity (was unauthenticated capability probe).
- `creditPracticeTime(nowMs)` now stamps `practiceDates` / `minutesDate` from the injected clock (was wall-clock `today`, breaking deterministic tests).

## Remaining issues

- Bind `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` for live pronunciation scoring validation.
- Native-speaker review of Azure score reasonableness (Phase 5 of pronunciation brief).
- Optional: install Playwright WebKit system deps for true Safari engine runs.

## Recommendations

1. Keep `npm run test:qa` on PRs (unit + critical desktop Playwright).
2. Run `TEST_QA_FULL=1 npm run test:qa` before release (all viewports).
3. Never point Playwright at production with seed scripts.
4. Treat mocked pronunciation scores as wiring tests only — not accuracy claims.

## Commands

```bash
npm run test:qa
TEST_QA_FULL=1 npm run test:qa
npx playwright show-report qa-reports/playwright-html
```
