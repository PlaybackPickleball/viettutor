# AI Bilingual Karaoke Engine (MVP)

Built on ÁMi Sing. Playback never re-runs AI — only approved `KaraokeSong` JSON.

## Modes
- **Learn** — progressive word fill, contextual glosses (phrase-grouped), full-line EN, tone cue, tap-to-vocab
- **Sing** — clean lyrics, translations hidden
- **Practice** — loop line, TTS, mic + pronunciation hook

## Data (ms)
`LyricToken`: text, startMs, endMs, contextualEnglish, toneMetadata, lineId, phraseGroupId?, alignmentConfidence?, reviewStatus?

## Pipeline (offline stubs)
`src/lib/karaoke/pipeline.ts` — Demucs → WhisperX (preserve verified lyrics) → LLM enrich → flag uncertain → persist JSON.

## Try it
1. `/sing/xin-chao-moi-ngay` — bilingual player (original demo)  
2. `/sing/ngay-mai-nguoi-ta-lay-chong` · `/sing/hat-mua-vuong-van` — licensed free-to-use masters + energy-aligned karaoke JSON  
3. Admin align: `/sing/admin/align/<songId>`  
4. Fixtures: `src/lib/karaoke/fixtures/*.json` (timings from audio energy; refine in admin)
