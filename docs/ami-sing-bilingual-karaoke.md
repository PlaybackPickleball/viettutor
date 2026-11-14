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
1. `/sing/xin-chao-moi-ngay` — bilingual player  
2. `/sing/admin/align/xin-chao-moi-ngay` — timeline edit + dry-run job  
3. Fixture: `src/lib/karaoke/fixtures/xin-chao-bilingual.ts`
