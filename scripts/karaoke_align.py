#!/usr/bin/env python3
"""
Forced karaoke alignment for ÁMi Sing.

1) Optional Demucs vocal isolation
2) stable-whisper forced alignment against verified Vietnamese lyrics
3) Collapse repair for failed segments / stretched syllables / instrumental gaps
4) Emit word-level start/end seconds (ASR text discarded — verified lyrics kept)

Usage:
  python3 scripts/karaoke_align.py \
    --audio path/to/song.mp3 \
    --lyrics path/to/lyrics.txt \
    --out path/to/align.json \
    [--no-demucs] [--model base] [--language vi]
"""

from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Demucs + stable-whisper forced align")
    p.add_argument("--audio", required=True)
    p.add_argument("--lyrics", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--model", default="base")
    p.add_argument("--language", default="vi")
    p.add_argument("--no-demucs", action="store_true")
    p.add_argument("--stems-dir", default="data/karaoke/stems")
    p.add_argument("--song-id", default="")
    return p.parse_args()


def load_lyrics(path: Path) -> list[str]:
    lines: list[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = re.sub(r"[.…]+\s*$", "", raw.strip()).strip()
        if line:
            lines.append(line)
    if not lines:
        raise SystemExit("No lyric lines found")
    return lines


def tokenize_line(vi: str) -> list[str]:
    parts = []
    for w in vi.split():
        clean = re.sub(r"^[^\wÀ-ỹ]+|[^\wÀ-ỹ]+$", "", w, flags=re.UNICODE)
        if clean:
            parts.append(clean)
    return parts


def isolate_vocals(audio: Path, stems_dir: Path, song_id: str) -> Path:
    stems_dir.mkdir(parents=True, exist_ok=True)
    out_root = stems_dir / (song_id or audio.stem)
    cmd = [
        sys.executable,
        "-m",
        "demucs",
        "--two-stems",
        "vocals",
        "-n",
        "htdemucs",
        "-o",
        str(out_root),
        str(audio),
    ]
    print("demucs:", " ".join(cmd), flush=True)
    subprocess.check_call(cmd)
    matches = list(out_root.rglob("vocals.wav"))
    if not matches:
        raise SystemExit("Demucs did not produce vocals.wav")
    print("vocals:", matches[0], flush=True)
    return matches[0]


def probe_duration_ms(audio: Path) -> int:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(audio),
        ],
        text=True,
    ).strip()
    return int(round(float(out) * 1000))


def pcm_energy(path: Path, start: float, end: float, sr: int = 16000):
    raw = subprocess.check_output(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-y",
            "-ss",
            str(max(0.0, start)),
            "-to",
            str(end),
            "-i",
            str(path),
            "-af",
            "highpass=f=200,lowpass=f=4000",
            "-ac",
            "1",
            "-ar",
            str(sr),
            "-f",
            "s16le",
            "-",
        ],
        stderr=subprocess.DEVNULL,
    )
    samples = memoryview(raw).cast("h")
    if not len(samples):
        return []
    win = max(1, int(sr * 0.05))
    vals = []
    i = 0
    while i + win <= len(samples):
        chunk = samples[i : i + win]
        s = sum(int(x) * int(x) for x in chunk)
        vals.append((start + i / sr, start + (i + win) / sr, math.sqrt(s / win)))
        i += win
    return vals


def is_collapsed(start: float, end: float, n_tokens: int, words: list[dict]) -> bool:
    dur = end - start
    avg = dur / max(1, n_tokens)
    if dur < 0.35 or avg < 0.18:
        return True
    if dur > 12.0:  # stretched / swallowed instrumental
        return True
    if words and (words[-1]["end"] - words[0]["start"]) < 0.35:
        return True
    return False


def repair_collapsed(segs: list[dict]) -> None:
    i = 0
    while i < len(segs):
        if not segs[i]["collapsed"]:
            i += 1
            continue
        run_start = i
        while i < len(segs) and segs[i]["collapsed"]:
            i += 1
        run_end = i - 1
        prev_end = segs[run_start - 1]["end"] if run_start > 0 else 0.0
        next_start = (
            segs[i]["start"]
            if i < len(segs)
            else prev_end + (run_end - run_start + 1) * 6.5
        )
        n = run_end - run_start + 1
        gap = max(0.5, next_start - prev_end)
        typical = min(7.0, max(3.5, gap / n))
        needed = n * typical
        window_start = max(prev_end + 0.25, next_start - needed)
        step = (next_start - window_start) / n
        for k in range(n):
            a = window_start + k * step
            b = window_start + (k + 1) * step
            segs[run_start + k].update(
                start=a, end=b, collapsed=False, repaired=True, tokens=[]
            )


def energy_split_tokens(audio: Path, start: float, end: float, verified: list[str]) -> list[dict]:
    vals = pcm_energy(audio, start, end)
    if not vals:
        step = (end - start) / max(1, len(verified))
        return [
            {
                "text": tok,
                "start": start + j * step,
                "end": start + (j + 1) * step,
                "confidence": 0.55,
            }
            for j, tok in enumerate(verified)
        ]
    energies = [max(0.0, v[2]) for v in vals]
    total = sum(energies) or 1.0
    targets = [(j + 1) / len(verified) for j in range(len(verified))]
    cum = 0.0
    ti = 0
    starts = [start]
    for (t0, t1, rms), e in zip(vals, energies):
        cum += e / total
        while ti < len(targets) and cum >= targets[ti]:
            starts.append(t1)
            ti += 1
    while len(starts) < len(verified) + 1:
        starts.append(end)
    starts[-1] = end
    return [
        {
            "text": tok,
            "start": starts[j],
            "end": max(starts[j] + 0.05, starts[j + 1]),
            "confidence": 0.62,
        }
        for j, tok in enumerate(verified)
    ]


def align_song(audio: Path, lines: list[str], model_name: str, language: str) -> list[dict]:
    import stable_whisper

    print(f"loading whisper model {model_name}…", flush=True)
    model = stable_whisper.load_model(model_name)
    print("forced aligning…", flush=True)
    result = model.align(
        str(audio),
        "\n".join(lines),
        language=language,
        original_split=True,
        nonspeech_skip=5.0,
        max_word_dur=3.5,
        word_dur_factor=2.0,
        remove_instant_words=True,
    )
    if result is None:
        raise SystemExit("Alignment returned no result")

    segs: list[dict] = []
    for i, seg in enumerate(result.segments or []):
        words = []
        for w in seg.words or []:
            word = (w.word or "").strip()
            if not word:
                continue
            words.append(
                {
                    "text": word,
                    "start": float(w.start),
                    "end": float(w.end),
                    "confidence": float(getattr(w, "probability", 0.0) or 0.0),
                }
            )
        a, b = float(seg.start), float(seg.end)
        ntok = len(tokenize_line(lines[i])) if i < len(lines) else max(1, len(words))
        segs.append(
            {
                "textVi": lines[i] if i < len(lines) else (seg.text or "").strip(),
                "start": a,
                "end": b,
                "tokens": words,
                "collapsed": is_collapsed(a, b, ntok, words),
            }
        )

    repair_collapsed(segs)
    # second pass for overlong lines after repair
    for s in segs:
        ntok = len(tokenize_line(s["textVi"]))
        if is_collapsed(s["start"], s["end"], ntok, s.get("tokens") or []):
            s["collapsed"] = True
    if any(s["collapsed"] for s in segs):
        repair_collapsed(segs)

    out_lines: list[dict] = []
    for s in segs:
        verified = tokenize_line(s["textVi"])
        words = s.get("tokens") or []
        healthy = words and (words[-1]["end"] - words[0]["start"]) >= max(
            0.45, 0.12 * len(verified)
        )
        if healthy and abs(len(words) - len(verified)) <= 2:
            tokens = []
            for j, tok in enumerate(verified):
                if len(words) == len(verified):
                    w = words[j]
                else:
                    a0 = int(j * len(words) / len(verified))
                    a1 = max(a0 + 1, int((j + 1) * len(words) / len(verified)))
                    chunk = words[a0:a1]
                    w = {
                        "start": chunk[0]["start"],
                        "end": chunk[-1]["end"],
                        "confidence": sum(c["confidence"] for c in chunk) / len(chunk),
                    }
                tokens.append(
                    {
                        "text": tok,
                        "start": w["start"],
                        "end": max(w["start"] + 0.05, w["end"]),
                        "confidence": w.get("confidence", 0.8),
                    }
                )
        else:
            tokens = energy_split_tokens(audio, s["start"], s["end"], verified)

        for t in tokens:
            t["start"] = max(s["start"], min(s["end"] - 0.04, t["start"]))
            t["end"] = max(t["start"] + 0.04, min(s["end"], t["end"]))

        out_lines.append(
            {
                "textVi": s["textVi"],
                "start": tokens[0]["start"],
                "end": tokens[-1]["end"],
                "tokens": tokens,
                "repaired": bool(s.get("repaired")),
            }
        )
    return out_lines


def main() -> None:
    args = parse_args()
    audio = Path(args.audio).resolve()
    lines = load_lyrics(Path(args.lyrics).resolve())
    out_path = Path(args.out).resolve()

    align_audio = audio
    demucs_used = False
    if not args.no_demucs:
        try:
            align_audio = isolate_vocals(audio, Path(args.stems_dir), args.song_id or audio.stem)
            demucs_used = True
        except Exception as e:
            print(f"demucs failed ({e}); falling back to full mix", flush=True)
            align_audio = audio
            demucs_used = False

    mapped = align_song(align_audio, lines, args.model, args.language)
    # If we aligned on vocals stem, times still match original mix timeline (Demucs preserves length).
    duration_ms = probe_duration_ms(audio)
    doc = {
        "audioPath": str(audio),
        "alignAudioPath": str(align_audio),
        "demucsUsed": demucs_used,
        "language": args.language,
        "model": args.model,
        "durationMs": duration_ms,
        "pipelineVersion": "demucs-stable-whisper-align-v1",
        "lineCount": len(mapped),
        "wordCount": sum(len(l["tokens"]) for l in mapped),
        "lines": mapped,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": True,
                "out": str(out_path),
                "lines": doc["lineCount"],
                "words": doc["wordCount"],
                "demucsUsed": demucs_used,
                "durationMs": duration_ms,
            }
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
