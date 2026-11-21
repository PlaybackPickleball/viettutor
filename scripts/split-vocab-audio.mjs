#!/usr/bin/env node
/**
 * Split First-100 vocabulary masters into padded per-word MP3s.
 * Male (10) + female (90) map to original pack IDs — not position-in-file.
 * Silence detection is an estimate — not linguistic validation.
 *
 * Usage:
 *   node scripts/split-vocab-audio.mjs
 *
 * Sources (defaults):
 *   public/audio/vi/vocabulary/source/male-10.mp3
 *   public/audio/vi/vocabulary/source/female-90.mp3
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = join(root, "public/audio/vi/vocabulary");
const sourceDir = join(outDir, "source");
const maleSrc = join(sourceDir, "male-10.mp3");
const femaleSrc = join(sourceDir, "female-90.mp3");
const packPath = join(root, "src/lib/vocabulary/packData.json");
const generatedPath = join(root, "src/lib/vocabulary/packLessons.generated.json");

/** Spoken order in male-10.mp3 → original pack IDs. */
const MALE_PACK_IDS = [1, 3, 5, 6, 8, 11, 15, 51, 52, 59];

const PAD = 0.04;
const MALE_NOISE_DB = -35;
const MALE_MIN_SILENCE = 0.08;
const FEMALE_NOISE_DB = -36;
const FEMALE_MIN_SILENCE = 0.11;

function ffprobeDuration(file) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(`ffprobe failed: ${r.stderr}`);
  return Number(String(r.stdout).trim());
}

function silencePairs(file, noiseDb, minSilence) {
  const r = spawnSync(
    "ffmpeg",
    ["-i", file, "-af", `silencedetect=noise=${noiseDb}dB:d=${minSilence}`, "-f", "null", "-"],
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

function meanVolume(file, start, end) {
  const r = spawnSync(
    "ffmpeg",
    [
      "-i",
      file,
      "-af",
      `atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,volumedetect`,
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  const log = `${r.stderr || ""}${r.stdout || ""}`;
  const m = log.match(/mean_volume:\s*([-\d.]+)/);
  return m ? Number(m[1]) : null;
}

function autoFlags(clips, index) {
  const c = clips[index];
  const flags = [];
  if (c.speechDuration < 0.22) flags.push("short");
  if (c.meanVolumeDb != null && c.meanVolumeDb < -45) flags.push("silent");
  if (index > 0) {
    const gap = c.speechStart - clips[index - 1].speechEnd;
    if (gap < 0.08) flags.push("overlap-risk");
  }
  if (index < clips.length - 1) {
    const gap = clips[index + 1].speechStart - c.speechEnd;
    if (gap < 0.08) flags.push("overlap-risk");
  }
  // Multi-syllable words that came out unusually short.
  if (c.vi.includes(" ") && c.speechDuration < 0.35) flags.push("short");
  // Monosyllables that are unusually long may contain a second word / breath.
  if (!c.vi.includes(" ") && c.speechDuration > 0.85) flags.push("overlap");
  return [...new Set(flags)];
}

function loadPackWords() {
  const pack = JSON.parse(readFileSync(packPath, "utf8"));
  const generated = JSON.parse(readFileSync(generatedPath, "utf8"));
  if (pack.length !== 100 || generated.words.length !== 100) {
    throw new Error(`Expected 100 pack words, got pack=${pack.length} generated=${generated.words.length}`);
  }
  const conflicts = [];
  for (let i = 0; i < 100; i++) {
    const p = pack[i];
    const w = generated.words[i];
    if (p.id !== w.packId || w.id !== `v${String(p.id).padStart(3, "0")}` || p.vietnamese !== w.vi) {
      conflicts.push({ packId: p.id, generatedId: w.id, packVi: p.vietnamese, genVi: w.vi });
    }
  }
  if (conflicts.length) {
    console.error("Pack order conflict vs packLessons.generated.json — stop.");
    console.error(conflicts.slice(0, 10));
    process.exit(2);
  }
  return pack.map((p) => ({
    packId: p.id,
    wordId: `v${String(p.id).padStart(3, "0")}`,
    vi: p.vietnamese,
    en: p.english,
    category: p.category,
  }));
}

function encodeClip(src, start, end, out) {
  const af = `atrim=start=${start.toFixed(6)}:end=${end.toFixed(6)},asetpts=PTS-STARTPTS,apad=pad_dur=0.03`;
  const enc = spawnSync(
    "ffmpeg",
    ["-y", "-i", src, "-af", af, "-ac", "1", "-ar", "44100", "-b:a", "128k", out],
    { encoding: "utf8" },
  );
  if (enc.status !== 0) throw new Error(`ffmpeg encode failed for ${out}: ${enc.stderr}`);
}

function splitMaster({ src, voice, packIds, byPackId, noiseDb, minSilence, expected }) {
  if (!existsSync(src)) throw new Error(`Source not found: ${src}`);
  const duration = ffprobeDuration(src);
  const pairs = silencePairs(src, noiseDb, minSilence);
  const bounds = speechBounds(duration, pairs);
  if (bounds.length !== expected) {
    throw new Error(
      `${voice}: expected ${expected} speech segments, got ${bounds.length} (noise=${noiseDb}dB d=${minSilence}). Tune silence detect.`,
    );
  }
  if (packIds.length !== expected) {
    throw new Error(`${voice}: packIds length ${packIds.length} != expected ${expected}`);
  }

  const clips = [];
  for (let i = 0; i < expected; i++) {
    const packId = packIds[i];
    const meta = byPackId.get(packId);
    if (!meta) throw new Error(`Unknown pack id ${packId}`);
    const [a, b] = bounds[i];
    let start = Math.max(0, a - PAD);
    let end = Math.min(duration, b + PAD);
    if (i > 0) start = Math.max(start, (bounds[i - 1][1] + a) / 2);
    if (i < expected - 1) end = Math.min(end, (b + bounds[i + 1][0]) / 2);
    const filename = `${meta.wordId}.mp3`;
    const out = join(outDir, filename);
    encodeClip(src, start, end, out);
    const meanVolumeDb = meanVolume(src, a, b);
    clips.push({
      packId,
      wordId: meta.wordId,
      vi: meta.vi,
      en: meta.en,
      category: meta.category,
      voice,
      filename,
      path: `/audio/vi/vocabulary/${filename}`,
      sourcePath:
        voice === "male"
          ? "/audio/vi/vocabulary/source/male-10.mp3"
          : "/audio/vi/vocabulary/source/female-90.mp3",
      speechStart: Number(a.toFixed(4)),
      speechEnd: Number(b.toFixed(4)),
      clipStart: Number(start.toFixed(4)),
      clipEnd: Number(end.toFixed(4)),
      speechDuration: Number((b - a).toFixed(4)),
      meanVolumeDb,
      autoFlags: [],
      spokenIndex: i + 1,
    });
  }
  for (let i = 0; i < clips.length; i++) {
    clips[i].autoFlags = autoFlags(clips, i);
  }
  return { duration, clips, detect: { noiseDb, minSilence, padSec: PAD } };
}

mkdirSync(outDir, { recursive: true });
const words = loadPackWords();
const byPackId = new Map(words.map((w) => [w.packId, w]));
const maleSet = new Set(MALE_PACK_IDS);
const femalePackIds = words.map((w) => w.packId).filter((id) => !maleSet.has(id));
if (femalePackIds.length !== 90) {
  throw new Error(`Expected 90 female IDs, got ${femalePackIds.length}`);
}

console.log("Splitting male-10…");
const male = splitMaster({
  src: maleSrc,
  voice: "male",
  packIds: MALE_PACK_IDS,
  byPackId,
  noiseDb: MALE_NOISE_DB,
  minSilence: MALE_MIN_SILENCE,
  expected: 10,
});

console.log("Splitting female-90…");
const female = splitMaster({
  src: femaleSrc,
  voice: "female",
  packIds: femalePackIds,
  byPackId,
  noiseDb: FEMALE_NOISE_DB,
  minSilence: FEMALE_MIN_SILENCE,
  expected: 90,
});

const allClips = [...male.clips, ...female.clips].sort((a, b) => a.packId - b.packId);
if (allClips.length !== 100) {
  throw new Error(`Expected 100 clips, got ${allClips.length}`);
}
for (let i = 0; i < 100; i++) {
  if (allClips[i].packId !== i + 1) {
    throw new Error(`Missing or mis-ordered packId at index ${i}: ${allClips[i].packId}`);
  }
}

const manifest = {
  sourceMale: "/audio/vi/vocabulary/source/male-10.mp3",
  sourceFemale: "/audio/vi/vocabulary/source/female-90.mp3",
  sourceNote:
    "Male 10 + female 90 masters. Clips map to original pack IDs (v001–v100). Splitting ≠ linguistic validation.",
  malePackIds: MALE_PACK_IDS,
  femalePackIds,
  maleDetect: male.detect,
  femaleDetect: female.detect,
  maleDurationSec: Number(male.duration.toFixed(4)),
  femaleDurationSec: Number(female.duration.toFixed(4)),
  clips: allClips,
  suspect: allClips.filter((c) => c.autoFlags.length > 0),
  approved: false,
};

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

// Emit TypeScript bounds helper data for the catalog module.
const boundsTs = `/** Auto-generated by scripts/split-vocab-audio.mjs — do not edit by hand. */
import type { VocabAudioFlag } from "./audio";

export const VOCAB_AUDIO_DEFAULT_BOUNDS: ReadonlyArray<{
  packId: number;
  voice: "male" | "female";
  speechStart: number;
  speechEnd: number;
  meanVolumeDb: number | null;
  autoFlags: VocabAudioFlag[];
}> = ${JSON.stringify(
  allClips.map((c) => ({
    packId: c.packId,
    voice: c.voice,
    speechStart: c.speechStart,
    speechEnd: c.speechEnd,
    meanVolumeDb: c.meanVolumeDb,
    autoFlags: c.autoFlags,
  })),
  null,
  2,
)};
`;

writeFileSync(join(root, "src/lib/vocabulary/audioBounds.generated.ts"), boundsTs);

console.log(`Wrote ${allClips.length} clips + manifest.json`);
console.log(
  "Suspect:",
  manifest.suspect.map((c) => `v${String(c.packId).padStart(3, "0")}:${c.vi}:${c.autoFlags.join(",")}`).join(" ") ||
    "(none)",
);
