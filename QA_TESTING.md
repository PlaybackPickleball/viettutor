# ÁMi Lingua — QA Testing

Automated regression for the Vietnamese/English learning app. Progress lives in **browser localStorage** (isolated per profile). Routine e2e **mocks** TTS, Azure assess, and paid AI routes so CI never spends production keys or touches production user data.

## Commands

```bash
# Unit + critical desktop Playwright (builds the app first)
npm run test:qa

# Full multi-viewport Playwright (desktop + mobile + iPhone + tablet)
TEST_QA_FULL=1 npm run test:qa

# Vitest only
npm run test:unit

# Playwright only (requires a prior `npm run build`, or a running server)
npm run test:e2e:critical
npm run test:e2e

# Regenerate markdown summary from the last Playwright JSON
npm run test:qa:report

# Inspect HTML report / failure traces
npx playwright show-report qa-reports/playwright-html
```

Point at a **local or staging** server only:

```bash
npm run build && npm run start -- -p 3100
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e:critical
```

**Do not** run seed/destructive e2e against production (`https://ami-lingua.apps.grok.bot`).

## Layout

| Path | Role |
|------|------|
| `e2e/fixtures/seed.ts` | Test profiles + paid-route mocks |
| `e2e/helpers/pathLesson.ts` | Drive Đánh Vần path exercises |
| `e2e/journey-*.spec.ts` | Journeys A–E |
| `e2e/smoke-routes.spec.ts` | Route load + no pageerror |
| `playwright.config.ts` | Projects / artifacts under `qa-reports/` |
| `scripts/run-qa.mjs` | `npm run test:qa` orchestrator |
| `scripts/qa-report.mjs` | Writes `qa-reports/latest-summary.md` |
| `.github/workflows/qa.yml` | PR unit + critical e2e |

## Journeys

- **A — New student:** welcome → Learn Vietnamese → onboarding → Foundations `w0-l01` → XP → refresh.
- **B — Returning student:** seeded path XP → resume `w0-l02` → XP increases.
- **C — Pronunciation:** speak-compare + studio Say with **mocked** `/api/vi/*` (wiring/honesty only — not real scoring accuracy).
- **D — Karaoke:** fixture timestamp sync (`findTokenAtMs`) + player smoke.
- **E — English:** welcome → Học Tiếng Anh; seeded English home/speak.

## Adding a test

1. Prefer seeding via `seedVietnameseLearner` / `seedEnglishLearner` instead of clicking every setup screen.
2. Always call `mockPaidServices(page)` in `beforeEach` for browser tests.
3. Assert **outcomes** (URL, text, localStorage-backed XP), not only that a click succeeded.
4. Keep real Azure / OpenAI calls in a separately gated integration job — never in default CI.
5. Re-run `npm run test:qa` and commit an updated `qa-reports/latest-summary.md` when coverage changes meaningfully.

## Viewports

Configured projects: Desktop Chrome, Pixel 5, iPhone 13 viewport (Chromium), iPad Pro 11. True WebKit requires host system packages (`npx playwright install-deps webkit`).

## Distinguishing coverage

| Covered by automation | Needs manual / native validation |
|-----------------------|----------------------------------|
| Navigation, XP persistence, path completion happy paths | Real mic + Azure score quality |
| Mocked assess failure/success UX | Tone model (not validated) |
| Karaoke timestamp fixtures | Lyric sync feel with headphones |
| English route smoke | Full English curriculum depth |
| Per-viewer English rate-limit keys | Load/penetration testing |

## Security notes for testers

- No secrets in repo or Playwright env files.
- No real email/payment.
- Mock paid AI in routine runs.
- Require human approval before schema changes or production deploys.
