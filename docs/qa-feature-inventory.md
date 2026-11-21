# Feature inventory (QA)

Presence of code ≠ proven behavior — journeys must execute. Full agent research dump (absolute paths): `/cursor/stores/bc-63073497-eece-4c2c-8006-163e8fb31fd2/internal/qa-feature-inventory.md` (from [Map app features inventory](bc-3c3d32f1-6cbd-58c8-9909-e56019711784)).

## Stack

- Next.js 16.4.6 / React 19 / Tailwind / Vitest / Playwright
- Auth: Cursor `requireIdentity` on paid/AI/assess/TTS and karaoke gates; local `identity.dev` for simulation
- Learner progress is device **localStorage** (Supabase client is a stub)

## Progress keys

| Key | Feature |
|-----|---------|
| `ami-lingua.course.v1` | Active course (VI / EN) + text size |
| `ami-lingua.vi-onboarding.v1` | VI onboarding |
| `ami-lingua.progress.v2` | Alphabet studio letters / stars / practice clock |
| `ami-lingua.phonics-path.v1` | Đánh Vần 2.0 XP, stars, badges, streak |
| `ami-lingua.phonics.v1` | Legacy intro phonics completions |
| `ami-lingua.hear-write.v1` | Hear & Write combo mastery |
| `ami-lingua.vi-pronunciation.v1` | VI assess history |
| `ami-lingua.vi-to-en.v1` | English course |
| `ami-lingua.vocab.v1` (+ reading keys) | Saved vocabulary / reading drafts |
| `ami-lingua.get-started.v1` | First-run guide dismissed (`"1"`) |
| Sing / karaoke | `ami-lingua.sing-*`, learn-lyrics, studio, rights-audit, align drafts |

## Frontend routes (31 pages)

| Area | Routes |
|------|--------|
| Entry | `/`, `/welcome`, `/onboarding`, `/settings`, `/progress`, `/vocab` |
| Alphabet | `/studio/[id]/{hear,say,write,object}` |
| Đánh Vần | `/danh-van`, `/danh-van/path/[id]`, `/danh-van/lesson/[id]`, `/danh-van/review`, `/hear-write` |
| Scan | `/scan`, `/scan/read`, `/scan/review` |
| Sing | `/sing`, `/sing/[songId]`, `/sing/admin`, `/sing/admin/align/[songId]` |
| English | `/en`, `/en/onboarding`, `/en/lessons`, `/en/lesson/[id]`, `/en/speak`, `/en/review`, `/en/sing`, `/en/scan`, `/en/write` |

## API

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/tts` | VI TTS; identity + rate limit |
| POST | `/api/analyze-image`, `/api/analyze-text` | Scan/tutor AI |
| GET/POST | `/api/vi/status`, `/api/vi/assess` | Deepgram VI transcription match; tone not validated |
| GET/POST | `/api/english/status`, `/assess`, `/teacher`, `/translate` | Status requires identity; rate limits per viewer |
| * | `/api/sing/*` | Stream, lyrics, karaoke doc, align, media, dev-seed |

## Gamification

- **Path XP** only (`phonics-path.v1`): +10 first clear, +5 review bonus; replay = stars only
- Alphabet **stars** (not XP); English uses completion/review counts (no XP currency)

## Automated vs still manual

Covered by `npm run test:qa` / journeys A–E: see `QA_TESTING.md` and `qa-reports/latest-summary.md`.

**Still thin or manual:** scan OCR live camera, karaoke admin align, true WebKit, real Azure score quality + native-speaker review, full 149-lesson marathon, EN teacher/translate live calls, hear-write depth, daily review depth.
