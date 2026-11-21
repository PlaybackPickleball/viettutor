#!/usr/bin/env node
/**
 * Split ElevenLabs 29-letter alphabet master into padded per-letter MP3s.
 * Silence detection is an estimate — not linguistic validation.
 *
 * Usage:
 *   node scripts/split-alphabet-audio.mjs [source.mp3]
 *
 * Default source: public/audio/vi/alphabet/source/elevenlabs-alphabet-29.mp3
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = join(root, "public/audio/vi/alphabet");
const defaultSrc = join(outDir, "source/elevenlabs-alphabet-29.mp3");
const src = resolve(process.argv[2] || defaultSrc);

const LETTERS = [
  ["a", "a"],
  ["ă", "aw"],
  ["â", "aa"],
  ["b", "b"],
  ["c", "c"],
  ["d", "d"],
  ["đ", "dd"],
  ["e", "e"],
  ["ê", "ee"],
  ["g", "g"],
  ["h", "h"],
  ["i", "i"],
  ["k", "k"],
  ["l", "l"],
  ["m", "m"],
  ["n", "n"],
  ["o", "o"],
  ["ô", "oo"],
  ["ơ", "ow"],
  ["p", "p"],
  ["q", "q"],
  ["r", "r"],
  ["s", "s"],
  ["t", "t"],
  ["u", "u"],
  ["ư", "uw"],
  ["v", "v"],
  ["x", "x"],
  ["y", "y"],
];

const PAD = 0.04;
const NOISE_DB = -35;
const MIN_SILENCE = 0.08;

function ffprobeDuration(file) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(`ffprobe failed: ${r.stderr}`);
  return Number(String(r.stdout).trim());
}

function silencePairs(file) {
  const r = spawnSync(
    "ffmpeg",
    ["-i", file, "-af", `silencedetect=noise=${NOISE_DB}dB:d=${MIN_SILENCE}`, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const log = `${r.stderr || ""}${r.stdout || ""}`;
  const starts = [...log.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => Number(m[1]));
  if (starts.length !== ends.length) {
    throw new Error(`silence start/end mismatch: ${starts.length} vs ${ends.length}`);
  }
  return starts.map((s, i) => [s, ends[i]]);
}

function speechBounds(duration, pairs) {
  // All silence gaps (including short intra-gap) separate letters; last silence is trailing.
  const nonTrailing = pairs.slice(0, -1);
  const speech = [];
  let t = 0;
  for (const [s, e] of nonTrailing) {
    if (s > t + 0.01) speech.push([t, s]);
    t = e;
  }
  const trailStart = pairs[pairs.length - 1]?.[0] ?? duration;
  if (trailStart > t + 0.01) speech.push([t, trailStart]);
  return speech;
}

function autoFlags(clips, index) {
  const c = clips[index];
  const flags = [];
  if (c.speechDuration < 0.2) flags.push("short");
  if (index > 0) {
    const gap = c.speechStart - clips[index - 1].speechEnd;
    if (gap < 0.08) flags.push("overlap-risk");
  }
  if (index < clips.length - 1) {
    const gap = clips[index + 1].speechStart - c.speechEnd;
    if (gap < 0.08) flags.push("overlap-risk");
  }
  return flags;
}

if (!existsSync(src)) {
  console.error(`Source not found: ${src}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const duration = ffprobeDuration(src);
const pairs = silencePairs(src);
const bounds = speechBounds(duration, pairs);
if (bounds.length !== 29) {
  console.error(`Expected 29 speech segments, got ${bounds.length}. Tune silence detect.`);
  process.exit(1);
}

const clips = [];
for (let i = 0; i < 29; i++) {
  const [grapheme, slug] = LETTERS[i];
  const [a, b] = bounds[i];
  let start = Math.max(0, a - PAD);
  let end = Math.min(duration, b + PAD);
  if (i > 0) start = Math.max(start, (bounds[i - 1][1] + a) / 2);
  if (i < 28) end = Math.min(end, (b + bounds[i + 1][0]) / 2);
  const filename = `alphabet_${String(i + 1).padStart(2, "0")}_${slug}.mp3`;
  const out = join(outDir, filename);
  const af = `atrim=start=${start.toFixed(6)}:end=${end.toFixed(6)},asetpts=PTS-STARTPTS,apad=pad_dur=0.03`;
  const enc = spawnSync(
    "ffmpeg",
    ["-y", "-i", src, "-af", af, "-ac", "1", "-ar", "44100", "-b:a", "128k", out],
    { encoding: "utf8" },
  );
  if (enc.status !== 0) throw new Error(`ffmpeg encode failed for ${filename}: ${enc.stderr}`);
  clips.push({
    index: i + 1,
    grapheme,
    slug,
    filename,
    path: `/audio/vi/alphabet/${filename}`,
    speechStart: Number(a.toFixed(4)),
    speechEnd: Number(b.toFixed(4)),
    clipStart: Number(start.toFixed(4)),
    clipEnd: Number(end.toFixed(4)),
    speechDuration: Number((b - a).toFixed(4)),
    autoFlags: [],
  });
}

for (let i = 0; i < clips.length; i++) {
  clips[i].autoFlags = autoFlags(clips, i);
}

const manifest = {
  source: "/audio/vi/alphabet/source/elevenlabs-alphabet-29.mp3",
  sourceNote:
    "Thanh Ngọc ElevenLabs — original preserved. Splitting ≠ linguistic validation; ElevenLabs may mispronounce letters.",
  dialect: "southern-intended",
  voice: "Thanh Ngọc (ElevenLabs)",
  detect: { noiseDb: NOISE_DB, minSilence: MIN_SILENCE, padSec: PAD },
  durationSec: Number(duration.toFixed(4)),
  clips,
  suspect: clips.filter((c) => c.autoFlags.length > 0),
  approved: false,
};

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${clips.length} clips + manifest.json`);
console.log(
  "Suspect:",
  manifest.suspect.map((c) => `${c.grapheme}:${c.autoFlags.join(",")}`).join(" ") || "(none)",
);
