# Vocabulary audio split workflow

Reusable FFmpeg silence-detect pipeline for continuous vocabulary masters
(ElevenLabs batches, etc.). Maps spoken order → First-100 pack IDs, pads each
clip **100–150 ms**, exports MP3s, and writes a JSON manifest.

## Requirements

- `ffmpeg` + `ffprobe` on `PATH`
- Python 3.10+ (stdlib only — no `pydub` required)

## Female 90-word master (Thanh Ngọc)

Source of record:

`public/audio/vi/vocabulary/source/female-90.mp3`

Spoken order = every First-100 pack ID **except** the male set
`1, 3, 5, 6, 8, 11, 15, 51, 52, 59` (90 entries). Vietnamese spellings
(including tones) come from `src/lib/vocabulary/packData.json`.

Canonical spoken script (locked to Nicola’s list):

`scripts/vocab_audio/wordlists/female-90-spoken-order.txt`

`split_batch.py` validates that file against pack headwords before splitting.
Pass `--spoken-order path.txt` for future batches.

### Split into a review batch

```bash
python3 scripts/vocab_audio/split_batch.py \
  --source public/audio/vi/vocabulary/source/female-90.mp3 \
  --voice female \
  --expected 90 \
  --pad-ms 125 \
  --batch-id female-90-thanh-ngoc
```

Outputs under `public/audio/vi/vocabulary/batches/<batch-id>/`:

- `vNNN.mp3` — one clip per vocabulary ID  
- `manifest.json` — `wordId` + `vi` → filename mapping  
- `NEEDS_REVIEW.json` — **only** if segment count ≠ expected (no IDs assigned)

### Promote into lessons (never clobber verified)

Live learner paths are `/audio/vi/vocabulary/vNNN.mp3` (wired via
`src/lib/vocabulary/audio.ts`). Promote copies batch clips into that folder:

```bash
python3 scripts/vocab_audio/split_batch.py --bootstrap-verified   # once
python3 scripts/vocab_audio/split_batch.py --promote-batch female-90-thanh-ngoc
```

- Existing files listed in `public/audio/vi/vocabulary/verified.json` are **never** overwritten.
- `--force-overwrite` may replace *non-verified* live files only; verified locks still win.

### Future batches

```bash
python3 scripts/vocab_audio/split_batch.py \
  --source /path/to/new-master.mp3 \
  --voice female \
  --expected 90 \
  --pad-ms 125 \
  --batch-id female-90-$(date -u +%Y%m%d) \
  --install-source-as female-90-next.mp3
```

If silence detect returns ≠ 90 segments, the script exits `3`, writes
`NEEDS_REVIEW.json`, and does **not** map vocabulary IDs.

Tune with `--noise-db` / `--min-silence` (defaults: female `-36 dB` / `0.11 s`,
male `-35 dB` / `0.08 s`).

## Related

- Node twin (legacy): `scripts/split-vocab-audio.mjs`  
- Review UI: `/review/vocab-audio`  
- Catalog: `src/lib/vocabulary/audio.ts`
