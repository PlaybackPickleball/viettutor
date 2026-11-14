import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import type { AlignmentReview, KaraokeSong, ReviewStatus } from "./types";
import { ALIGN_DIR, ensureKaraokeDirs } from "./store";
import { buildKaraokeSongFromAlign, type AlignResultIn } from "./buildSong";

/**
 * AI preprocessing pipeline.
 * Demucs + stable-whisper forced alignment run offline via scripts/karaoke_align.py.
 * Playback never calls these for published songs.
 */

export type PipelineInput = {
  songId: string;
  title: string;
  artist: string;
  audioPath: string;
  /** Verified Vietnamese lyrics — never replaced by ASR */
  verifiedLyricsVi: string[];
  isolateVocals?: boolean;
  model?: string;
  audioUrl?: string;
  previous?: KaraokeSong | null;
};

export type PipelineStep =
  | "accept"
  | "isolate_vocals"
  | "forced_alignment"
  | "preserve_lyrics"
  | "timestamp_segments"
  | "llm_enrichment"
  | "flag_uncertain"
  | "persist_json";

export type PipelineJob = {
  id: string;
  input: PipelineInput;
  steps: { step: PipelineStep; status: ReviewStatus; note?: string }[];
  output?: KaraokeSong;
  createdAt: string;
  alignRawPath?: string;
  log?: string;
};

export function describePipeline(): { step: PipelineStep; provider: string; note: string }[] {
  return [
    {
      step: "accept",
      provider: "admin",
      note: "Accept authorized audio + metadata + verified VI lyrics",
    },
    {
      step: "isolate_vocals",
      provider: "demucs htdemucs",
      note: "Vocal stem for cleaner alignment (optional fallback to full mix)",
    },
    {
      step: "forced_alignment",
      provider: "stable-whisper align (VI)",
      note: "Word-level timestamps; ASR text discarded — verified lyrics kept",
    },
    {
      step: "preserve_lyrics",
      provider: "guardrail",
      note: "Preserve spelling, capitalization, diacritics from verified source",
    },
    {
      step: "timestamp_segments",
      provider: "aligner",
      note: "Emit LyricLine / LyricToken with startMs/endMs",
    },
    {
      step: "llm_enrichment",
      provider: "admin / prior glosses",
      note: "Keep existing EN glosses/translations when re-aligning",
    },
    {
      step: "flag_uncertain",
      provider: "heuristics",
      note: "Low confidence → AlignmentReview needs_review",
    },
    {
      step: "persist_json",
      provider: "data/karaoke/approved",
      note: "Save approved KaraokeSong JSON; playback reads only this",
    },
  ];
}

export function flagUncertainTokens(song: KaraokeSong, threshold = 0.85): AlignmentReview[] {
  const reviews: AlignmentReview[] = [];
  for (const line of song.lines) {
    for (const tok of line.tokens) {
      const c = tok.alignmentConfidence;
      if (c != null && c < threshold) {
        reviews.push({
          id: `rev-${tok.id}`,
          songId: song.id,
          targetType: "token",
          targetId: tok.id,
          flag: "timing_uncertain",
          note: `Alignment confidence ${c.toFixed(2)} below ${threshold}`,
          status: "needs_review",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }
  return reviews;
}

function runPython(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("python3", args, {
      cwd: process.cwd(),
      env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

/** Execute Demucs + stable-whisper forced alignment (CPU; may take minutes). */
export async function runForcedAlignmentJob(input: PipelineInput): Promise<PipelineJob> {
  await ensureKaraokeDirs();
  const jobId = `job-${Date.now()}`;
  const lyricsPath = path.join(ALIGN_DIR, `${input.songId}.${jobId}.lyrics.txt`);
  const outPath = path.join(ALIGN_DIR, `${input.songId}.${jobId}.align.json`);
  await fs.writeFile(lyricsPath, input.verifiedLyricsVi.join("\n") + "\n", "utf8");

  const script = path.join(process.cwd(), "scripts", "karaoke_align.py");
  const args = [
    script,
    "--audio",
    input.audioPath,
    "--lyrics",
    lyricsPath,
    "--out",
    outPath,
    "--song-id",
    input.songId,
    "--model",
    input.model ?? "base",
    "--language",
    "vi",
  ];
  if (input.isolateVocals === false) args.push("--no-demucs");

  const steps = describePipeline().map((s) => ({
    step: s.step,
    status: "draft" as ReviewStatus,
    note: s.note,
  }));

  const result = await runPython(args);
  const log = `${result.stdout}\n${result.stderr}`.trim();

  if (result.code !== 0) {
    return {
      id: jobId,
      input,
      createdAt: new Date().toISOString(),
      steps: steps.map((s) => ({ ...s, status: "rejected" as ReviewStatus, note: log.slice(-500) })),
      log,
    };
  }

  const raw = JSON.parse(await fs.readFile(outPath, "utf8")) as AlignResultIn & {
    pipelineVersion?: string;
    demucsUsed?: boolean;
  };

  const song = buildKaraokeSongFromAlign({
    id: input.songId,
    title: input.title,
    artist: input.artist,
    audioUrl: input.audioUrl ?? `/api/sing/asset/${input.songId}`,
    align: {
      lines: raw.lines,
      durationMs: raw.durationMs,
      pipelineVersion: raw.pipelineVersion,
      demucsUsed: raw.demucsUsed,
    },
    previous: input.previous,
    publishStatus: "needs_review",
  });

  song.reviews = flagUncertainTokens(song);

  return {
    id: jobId,
    input,
    createdAt: new Date().toISOString(),
    steps: steps.map((s) => ({
      ...s,
      status: s.step === "persist_json" ? "draft" : ("approved" as ReviewStatus),
    })),
    output: song,
    alignRawPath: outPath,
    log,
  };
}

/** MVP dry-run record for UI when models cannot run. */
export function createDryRunJob(input: PipelineInput): PipelineJob {
  return {
    id: `job-${Date.now()}`,
    input,
    createdAt: new Date().toISOString(),
    steps: describePipeline().map((s) => ({
      step: s.step,
      status: "draft" as ReviewStatus,
      note: s.note,
    })),
  };
}
