#!/usr/bin/env python3
"""
Reusable vocabulary master → per-word MP3 splitter (FFmpeg silence detect).

Splits a continuous ElevenLabs (or similar) recording into one clip per
vocabulary entry, maps clips to pack IDs / Vietnamese headwords, pads speech
edges, and refuses to assign audio when the segment count ≠ expected.

Does NOT overwrite existing verified live clips unless --force-overwrite.

Examples:
  # Split the female-90 master into a reviewable batch (default pad 125 ms)
  python3 scripts/vocab_audio/split_batch.py \\
    --source public/audio/vi/vocabulary/source/female-90.mp3 \\
    --voice female --expected 90 \\
    --batch-id female-90-thanh-ngoc

  # After human review, promote new clips only (never clobber verified):
  python3 scripts/vocab_audio/split_batch.py \\
    --promote-batch female-90-thanh-ngoc

Silence detection is mechanical — not linguistic validation of tones.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PACK = ROOT / "src/lib/vocabulary/packData.json"
DEFAULT_GENERATED = ROOT / "src/lib/vocabulary/packLessons.generated.json"
LIVE_DIR = ROOT / "public/audio/vi/vocabulary"
BATCH_ROOT = LIVE_DIR / "batches"
VERIFIED_PATH = LIVE_DIR / "verified.json"
SOURCE_DIR = LIVE_DIR / "source"

MALE_PACK_IDS = [1, 3, 5, 6, 8, 11, 15, 51, 52, 59]

# Mid-range of the requested 100–150 ms pad (protects initial/final consonants).
DEFAULT_PAD_MS = 125
DEFAULT_NOISE_DB = {"male": -35.0, "female": -36.0}
DEFAULT_MIN_SILENCE = {"male": 0.08, "female": 0.11}

Voice = Literal["male", "female"]


@dataclass
class PackWord:
    pack_id: int
    word_id: str
    vi: str
    en: str
    category: str


@dataclass
class ClipRow:
    packId: int
    wordId: str
    vi: str
    en: str
    category: str
    voice: Voice
    filename: str
    path: str
    sourcePath: str
    speechStart: float
    speechEnd: float
    clipStart: float
    clipEnd: float
    speechDuration: float
    meanVolumeDb: float | None
    autoFlags: list[str]
    spokenIndex: int


def die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(code)


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True)


def ffprobe_duration(path: Path) -> float:
    r = run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(path),
        ]
    )
    if r.returncode != 0:
        die(f"ffprobe failed for {path}: {r.stderr.strip()}")
    return float(r.stdout.strip())


def silence_pairs(path: Path, noise_db: float, min_silence: float) -> list[tuple[float, float]]:
    r = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(path),
            "-af",
            f"silencedetect=noise={noise_db}dB:d={min_silence}",
            "-f",
            "null",
            "-",
        ]
    )
    log = f"{r.stderr or ''}{r.stdout or ''}"
    starts = [float(m) for m in re.findall(r"silence_start:\s*([\d.]+)", log)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([\d.]+)", log)]
    if len(starts) != len(ends):
        die(f"silence start/end mismatch: {len(starts)} vs {len(ends)}")
    return list(zip(starts, ends))


def speech_bounds(duration: float, pairs: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Treat inter-word silences as separators; drop trailing silence."""
    non_trailing = pairs[:-1]
    speech: list[tuple[float, float]] = []
    t = 0.0
    for s, e in non_trailing:
        if s > t + 0.01:
            speech.append((t, s))
        t = e
    trail_start = pairs[-1][0] if pairs else duration
    if trail_start > t + 0.01:
        speech.append((t, trail_start))
    return speech


def mean_volume_db(path: Path, start: float, end: float) -> float | None:
    r = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(path),
            "-af",
            f"atrim=start={start}:end={end},asetpts=PTS-STARTPTS,volumedetect",
            "-f",
            "null",
            "-",
        ]
    )
    log = f"{r.stderr or ''}{r.stdout or ''}"
    m = re.search(r"mean_volume:\s*([-\d.]+)", log)
    return float(m.group(1)) if m else None


def encode_clip(src: Path, start: float, end: float, out: Path) -> None:
    af = f"atrim=start={start:.6f}:end={end:.6f},asetpts=PTS-STARTPTS,apad=pad_dur=0.03"
    r = run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-i",
            str(src),
            "-af",
            af,
            "-ac",
            "1",
            "-ar",
            "44100",
            "-b:a",
            "128k",
            str(out),
        ]
    )
    if r.returncode != 0:
        die(f"ffmpeg encode failed for {out.name}: {r.stderr[-800:]}")


def load_pack_words(pack_path: Path, generated_path: Path) -> list[PackWord]:
    pack = json.loads(pack_path.read_text(encoding="utf-8"))
    generated = json.loads(generated_path.read_text(encoding="utf-8"))
    if len(pack) != 100 or len(generated["words"]) != 100:
        die(f"Expected 100 pack words, got pack={len(pack)} generated={len(generated['words'])}")
    conflicts = []
    for i in range(100):
        p = pack[i]
        w = generated["words"][i]
        word_id = f"v{int(p['id']):03d}"
        if p["id"] != w["packId"] or w["id"] != word_id or p["vietnamese"] != w["vi"]:
            conflicts.append(
                {
                    "packId": p["id"],
                    "generatedId": w["id"],
                    "packVi": p["vietnamese"],
                    "genVi": w["vi"],
                }
            )
    if conflicts:
        die(f"Pack order conflict vs packLessons.generated.json: {conflicts[:5]}")
    return [
        PackWord(
            pack_id=int(p["id"]),
            word_id=f"v{int(p['id']):03d}",
            vi=p["vietnamese"],
            en=p["english"],
            category=p["category"],
        )
        for p in pack
    ]


def pack_ids_for_voice(words: list[PackWord], voice: Voice) -> list[int]:
    male = set(MALE_PACK_IDS)
    if voice == "male":
        # Preserve spoken male order (not numeric pack order).
        return list(MALE_PACK_IDS)
    return [w.pack_id for w in words if w.pack_id not in male]


def load_spoken_order(path: Path) -> list[str]:
    lines = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        lines.append(line.rstrip(".").strip())
    return lines


def validate_spoken_order(
    spoken: list[str],
    pack_ids: list[int],
    by_pack: dict[int, PackWord],
) -> None:
    """Ensure the recording script matches pack Vietnamese headwords in spoken order."""
    if len(spoken) != len(pack_ids):
        die(
            f"Spoken-order list has {len(spoken)} words; expected {len(pack_ids)} "
            f"for this voice/pack mapping."
        )
    mismatches = []
    for i, (vi, pack_id) in enumerate(zip(spoken, pack_ids)):
        meta = by_pack[pack_id]
        if vi != meta.vi:
            mismatches.append(
                {
                    "spokenIndex": i + 1,
                    "spokenVi": vi,
                    "packId": pack_id,
                    "packVi": meta.vi,
                    "wordId": meta.word_id,
                }
            )
    if mismatches:
        die(
            "Spoken-order list does not match packData Vietnamese (tones must match). "
            f"First conflicts: {mismatches[:5]}"
        )


def auto_flags(clips: list[ClipRow], index: int) -> list[str]:
    c = clips[index]
    flags: list[str] = []
    if c.speechDuration < 0.22:
        flags.append("short")
    if c.meanVolumeDb is not None and c.meanVolumeDb < -45:
        flags.append("silent")
    if index > 0:
        gap = c.speechStart - clips[index - 1].speechEnd
        if gap < 0.08:
            flags.append("overlap-risk")
    if index < len(clips) - 1:
        gap = clips[index + 1].speechStart - c.speechEnd
        if gap < 0.08:
            flags.append("overlap-risk")
    if " " in c.vi and c.speechDuration < 0.35:
        flags.append("short")
    if " " not in c.vi and c.speechDuration > 0.85:
        flags.append("overlap")
    return sorted(set(flags))


def load_verified(path: Path = VERIFIED_PATH) -> set[str]:
    if not path.exists():
        # Default: every live MP3 already on disk is treated as verified.
        live = {p.stem for p in LIVE_DIR.glob("v*.mp3")}
        return live
    data = json.loads(path.read_text(encoding="utf-8"))
    return set(data.get("wordIds", []))


def write_verified(word_ids: set[str], path: Path = VERIFIED_PATH) -> None:
    payload = {
        "note": "Word IDs whose live MP3s must not be overwritten by split_batch.py without --force-overwrite.",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "wordIds": sorted(word_ids),
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def flag_for_review(batch_dir: Path, expected: int, got: int, detect: dict) -> Path:
    batch_dir.mkdir(parents=True, exist_ok=True)
    flag = {
        "status": "needs_review",
        "reason": "silence_segment_count_mismatch",
        "expected": expected,
        "got": got,
        "detect": detect,
        "message": (
            f"Silence detection produced {got} speech segments; expected {expected}. "
            "Do not assign vocabulary IDs. Tune --noise-db / --min-silence or fix the recording."
        ),
        "flaggedAt": datetime.now(timezone.utc).isoformat(),
    }
    out = batch_dir / "NEEDS_REVIEW.json"
    out.write_text(json.dumps(flag, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def split_master(
    *,
    source: Path,
    voice: Voice,
    pack_ids: list[int],
    by_pack: dict[int, PackWord],
    out_dir: Path,
    noise_db: float,
    min_silence: float,
    pad_sec: float,
    expected: int,
    public_source_path: str,
) -> dict:
    duration = ffprobe_duration(source)
    pairs = silence_pairs(source, noise_db, min_silence)
    bounds = speech_bounds(duration, pairs)
    detect = {
        "noiseDb": noise_db,
        "minSilence": min_silence,
        "padSec": pad_sec,
        "padMs": int(round(pad_sec * 1000)),
    }

    if len(bounds) != expected:
        flag_path = flag_for_review(out_dir, expected, len(bounds), detect)
        die(
            f"{voice}: expected {expected} speech segments, got {len(bounds)}. "
            f"Flagged for review: {flag_path}. Refusing to assign vocabulary IDs.",
            code=3,
        )

    if len(pack_ids) != expected:
        die(f"{voice}: pack id list length {len(pack_ids)} != expected {expected}")

    out_dir.mkdir(parents=True, exist_ok=True)
    clips: list[ClipRow] = []
    for i, pack_id in enumerate(pack_ids):
        meta = by_pack.get(pack_id)
        if not meta:
            die(f"Unknown pack id {pack_id}")
        a, b = bounds[i]
        start = max(0.0, a - pad_sec)
        end = min(duration, b + pad_sec)
        if i > 0:
            start = max(start, (bounds[i - 1][1] + a) / 2)
        if i < expected - 1:
            end = min(end, (b + bounds[i + 1][0]) / 2)
        filename = f"{meta.word_id}.mp3"
        out = out_dir / filename
        encode_clip(source, start, end, out)
        mean_db = mean_volume_db(source, a, b)
        clips.append(
            ClipRow(
                packId=pack_id,
                wordId=meta.word_id,
                vi=meta.vi,
                en=meta.en,
                category=meta.category,
                voice=voice,
                filename=filename,
                path=f"/audio/vi/vocabulary/{filename}",
                sourcePath=public_source_path,
                speechStart=round(a, 4),
                speechEnd=round(b, 4),
                clipStart=round(start, 4),
                clipEnd=round(end, 4),
                speechDuration=round(b - a, 4),
                meanVolumeDb=mean_db,
                autoFlags=[],
                spokenIndex=i + 1,
            )
        )

    for i in range(len(clips)):
        clips[i].autoFlags = auto_flags(clips, i)

    if len(list(out_dir.glob("v*.mp3"))) != expected:
        die(f"Post-write clip count mismatch in {out_dir}")

    return {
        "duration": duration,
        "detect": detect,
        "clips": clips,
    }


def write_batch_manifest(
    *,
    batch_dir: Path,
    batch_id: str,
    source: Path,
    voice: Voice,
    result: dict,
    pack_ids: list[int],
) -> Path:
    clips = [asdict(c) for c in result["clips"]]
    # Ensure Vietnamese orthography (tones/diacritics) round-trips in JSON.
    manifest = {
        "batchId": batch_id,
        "status": "split_ok",
        "voice": voice,
        "sourceFile": str(source.resolve()),
        "sourcePublicPath": clips[0]["sourcePath"] if clips else None,
        "expectedCount": len(pack_ids),
        "clipCount": len(clips),
        "packIds": pack_ids,
        "detect": result["detect"],
        "durationSec": round(result["duration"], 4),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "note": (
            "Silence split is mechanical. Vietnamese tones are preserved in the "
            "waveform and in vi spellings — not re-scored by this tool."
        ),
        "clips": clips,
        "suspect": [c for c in clips if c["autoFlags"]],
        "entries": [
            {"wordId": c["wordId"], "vi": c["vi"], "en": c["en"], "filename": c["filename"], "path": c["path"]}
            for c in clips
        ],
    }
    out = batch_dir / "manifest.json"
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def promote_batch(batch_id: str, force_overwrite: bool) -> None:
    batch_dir = BATCH_ROOT / batch_id
    manifest_path = batch_dir / "manifest.json"
    needs = batch_dir / "NEEDS_REVIEW.json"
    if needs.exists() and not manifest_path.exists():
        die(f"Batch {batch_id} is flagged for review ({needs}). Refusing promote.")
    if not manifest_path.exists():
        die(f"Missing batch manifest: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("clipCount") != manifest.get("expectedCount"):
        die("Batch clipCount ≠ expectedCount — refusing promote.")

    verified = load_verified()
    copied = []
    skipped = []
    for entry in manifest["entries"]:
        word_id = entry["wordId"]
        src = batch_dir / entry["filename"]
        dest = LIVE_DIR / entry["filename"]
        if not src.exists():
            die(f"Missing batch clip {src}")
        if dest.exists():
            if word_id in verified:
                # Verified locks always win — even with --force-overwrite.
                skipped.append({"wordId": word_id, "reason": "verified"})
                continue
            if not force_overwrite:
                skipped.append({"wordId": word_id, "reason": "exists"})
                continue
        shutil.copy2(src, dest)
        copied.append(word_id)

    report = {
        "batchId": batch_id,
        "copied": copied,
        "skipped": skipped,
        "forceOverwrite": force_overwrite,
        "promotedAt": datetime.now(timezone.utc).isoformat(),
    }
    (batch_dir / "promote-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Promote {batch_id}: copied {len(copied)}, skipped {len(skipped)} "
        f"(verified/existing protected)."
    )


def ensure_verified_bootstrap() -> None:
    """Lock every current live clip so future splits cannot clobber them."""
    if VERIFIED_PATH.exists():
        return
    live = {p.stem for p in LIVE_DIR.glob("v*.mp3")}
    if live:
        write_verified(live)
        print(f"Bootstrapped {VERIFIED_PATH} with {len(live)} verified wordIds.")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--source", type=Path, help="Master MP3 path")
    p.add_argument("--voice", choices=["male", "female"], default="female")
    p.add_argument("--expected", type=int, help="Expected speech segments (default: 90 female / 10 male)")
    p.add_argument("--batch-id", type=str, help="Batch folder name under public/audio/vi/vocabulary/batches/")
    p.add_argument("--pad-ms", type=int, default=DEFAULT_PAD_MS, help="Pad before/after speech (100–150 ms)")
    p.add_argument("--noise-db", type=float, help="silencedetect noise floor (dB)")
    p.add_argument("--min-silence", type=float, help="Minimum silence duration (seconds)")
    p.add_argument("--pack-data", type=Path, default=DEFAULT_PACK)
    p.add_argument("--generated", type=Path, default=DEFAULT_GENERATED)
    p.add_argument(
        "--spoken-order",
        type=Path,
        help=(
            "Optional text file: one Vietnamese headword per line in recording order. "
            "Validated against packData before splitting (default for female-90: "
            "scripts/vocab_audio/wordlists/female-90-spoken-order.txt)."
        ),
    )
    p.add_argument(
        "--install-source-as",
        type=str,
        help="Copy --source into public/.../source/<name> before splitting (e.g. female-90.mp3)",
    )
    p.add_argument(
        "--promote-batch",
        type=str,
        help="Promote an existing batch into the live vocab audio dir (skips verified)",
    )
    p.add_argument(
        "--force-overwrite",
        action="store_true",
        help="Allow replacing non-verified live clips on promote (verified.json still protected)",
    )
    p.add_argument(
        "--bootstrap-verified",
        action="store_true",
        help="Write verified.json from current live MP3s and exit",
    )
    return p.parse_args()


def main() -> None:
    args = parse_args()

    if args.bootstrap_verified:
        live = {p.stem for p in LIVE_DIR.glob("v*.mp3")}
        write_verified(live)
        print(f"Wrote {VERIFIED_PATH} ({len(live)} wordIds).")
        return

    if args.promote_batch:
        ensure_verified_bootstrap()
        promote_batch(args.promote_batch, force_overwrite=args.force_overwrite)
        return

    if not args.source:
        die("--source is required unless --promote-batch / --bootstrap-verified")
    source = args.source.resolve()
    if not source.exists():
        die(f"Source not found: {source}")

    if args.pad_ms < 100 or args.pad_ms > 150:
        die(f"--pad-ms must be in 100–150 (got {args.pad_ms})")

    voice: Voice = args.voice  # type: ignore[assignment]
    expected = args.expected or (10 if voice == "male" else 90)
    noise_db = args.noise_db if args.noise_db is not None else DEFAULT_NOISE_DB[voice]
    min_silence = args.min_silence if args.min_silence is not None else DEFAULT_MIN_SILENCE[voice]
    pad_sec = args.pad_ms / 1000.0
    batch_id = args.batch_id or f"{voice}-{expected}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    batch_dir = BATCH_ROOT / batch_id

    public_source_name = None
    if args.install_source_as:
        SOURCE_DIR.mkdir(parents=True, exist_ok=True)
        dest = SOURCE_DIR / Path(args.install_source_as).name
        if dest.exists():
            # Never silently replace a verified master recording.
            same = dest.read_bytes() == source.read_bytes()
            if not same and not args.force_overwrite:
                die(
                    f"Source already exists at {dest}. Pass the existing path as --source, "
                    "or use --force-overwrite to replace the master (live clips stay locked)."
                )
            if not same and args.force_overwrite:
                shutil.copy2(source, dest)
                print(f"Replaced master {dest}")
        else:
            shutil.copy2(source, dest)
            print(f"Installed master → {dest}")
        source = dest
        public_source_name = dest.name
    else:
        # Prefer a stable public path when the source already lives under source/.
        try:
            rel = source.relative_to(SOURCE_DIR)
            public_source_name = rel.as_posix()
        except ValueError:
            public_source_name = source.name

    public_source_path = f"/audio/vi/vocabulary/source/{public_source_name}"

    words = load_pack_words(args.pack_data, args.generated)
    by_pack = {w.pack_id: w for w in words}
    pack_ids = pack_ids_for_voice(words, voice)
    if voice == "male" and expected == 10:
        pack_ids = list(MALE_PACK_IDS)
    if len(pack_ids) != expected:
        die(f"Voice {voice} has {len(pack_ids)} pack ids but --expected={expected}")

    spoken_order_path = args.spoken_order
    if spoken_order_path is None and voice == "female" and expected == 90:
        default_list = Path(__file__).resolve().parent / "wordlists/female-90-spoken-order.txt"
        if default_list.exists():
            spoken_order_path = default_list
    if spoken_order_path is not None:
        spoken = load_spoken_order(spoken_order_path)
        validate_spoken_order(spoken, pack_ids, by_pack)
        print(f"Spoken-order check OK ({len(spoken)} words) ← {spoken_order_path}")

    print(
        f"Splitting {source.name} → batch {batch_id} "
        f"(voice={voice}, expected={expected}, pad={args.pad_ms}ms, "
        f"noise={noise_db}dB, d={min_silence}s)"
    )

    try:
        result = split_master(
            source=source,
            voice=voice,
            pack_ids=pack_ids,
            by_pack=by_pack,
            out_dir=batch_dir,
            noise_db=noise_db,
            min_silence=min_silence,
            pad_sec=pad_sec,
            expected=expected,
            public_source_path=public_source_path,
        )
    except SystemExit as e:
        if e.code == 3:
            raise
        raise

    manifest_path = write_batch_manifest(
        batch_dir=batch_dir,
        batch_id=batch_id,
        source=source,
        voice=voice,
        result=result,
        pack_ids=pack_ids,
    )

    clip_files = sorted(batch_dir.glob("v*.mp3"))
    if len(clip_files) != expected:
        flag_for_review(batch_dir, expected, len(clip_files), result["detect"])
        die(f"Expected {expected} MP3s, found {len(clip_files)} — flagged for review.", code=3)

    print(f"OK: wrote {len(clip_files)} clips + {manifest_path}")
    suspects = [c for c in result["clips"] if c.autoFlags]
    if suspects:
        print(
            "Suspect auto-flags:",
            " ".join(f"{c.wordId}:{c.vi}:{','.join(c.autoFlags)}" for c in suspects),
        )
    else:
        print("Suspect auto-flags: (none)")
    print(
        "Next: review the batch, then "
        f"python3 scripts/vocab_audio/split_batch.py --promote-batch {batch_id}"
    )


if __name__ == "__main__":
    main()
