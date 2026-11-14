# ÁMi Sing — karaoke synchronization

## Root cause (inspected)
Playback already uses `HTMLAudioElement.currentTime` via `KaraokePlayer` rAF. Sync failures on licensed ballads were primarily **bad timestamp data** (even-split / energy-estimated windows), not clock drift. Missing pieces: global offset, server-persisted approvals, real Demucs + forced alignment.

## Pipeline (offline / admin only)
1. Admin uploads MP3/WAV (or uses `public/sing/<id>.mp3`) and pastes **verified** Vietnamese lyrics.
2. Optional **Demucs** (`htdemucs`, vocals stem).
3. **stable-whisper `align`** forced alignment (`language=vi`) — verified lyrics kept; ASR text discarded.
4. Word `startMs` / `endMs` emitted; EN glosses/translations preserved from prior approved doc when possible.
5. Admin edits timings + **globalOffsetMs**, then **Approves** → `data/karaoke/approved/<id>.json` (and mirrors JSON fixtures when present).

Script: `scripts/karaoke_align.py`  
API: `POST /api/sing/align`, `GET|PUT /api/sing/karaoke/[songId]`  
Editor: `/sing/admin/align/<songId>`

## Playback
`alignedMs = round(audio.currentTime * 1000) - (globalOffsetMs ?? 0)`  
UI / EN translation features unchanged.

## CLI example
```bash
python3 scripts/karaoke_align.py \
  --audio public/sing/hat-mua-vuong-van.mp3 \
  --lyrics /tmp/lyrics.txt \
  --out data/karaoke/align/hat-mua.align.json \
  --song-id hat-mua-vuong-van
```
