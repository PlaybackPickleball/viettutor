# Feature inventory (QA)

Generated for the autonomous QA system. Presence of code ≠ proven behavior — journeys must execute.

## Stack

- Next.js 16 / React 19 / Tailwind / Vitest / Playwright
- Auth: Cursor `requireIdentity` on paid/API routes; local progress in `localStorage`
- No production DB for core path XP (device-local)

## Progress keys

| Key | Feature |
|-----|---------|
| `ami-lingua.course.v1` | Active course (VI / EN) |
| `ami-lingua.vi-onboarding.v1` | VI onboarding |
| `ami-lingua.progress.v2` | Alphabet studio letters |
| `ami-lingua.phonics-path.v1` | Đánh Vần 2.0 XP / lessons |
| `ami-lingua.vi-pronunciation.v1` | VI assess history |
| `ami-lingua.vi-to-en.v1` | English course |
| `ami-lingua.vocab.v1` | Saved vocabulary |
| Sing / karaoke keys | `ami-lingua.sing-*`, karaoke drafts |

## Frontend routes (high level)

Welcome `/` · `/welcome` · `/onboarding` · Dashboard · `/danh-van` · `/danh-van/path/[id]` · `/hear-write` · `/studio/[id]/{hear,say,write,object}` · `/sing` · `/sing/[songId]` · `/en/*` · `/scan*` · `/vocab` · `/progress` · `/settings`

## API

`/api/tts` · `/api/vi/{status,assess}` · `/api/english/{status,assess,teacher,translate}` · `/api/analyze-{image,text}` · `/api/sing/*`

## Automated vs manual

See `QA_TESTING.md` and `qa-reports/latest-summary.md`.
