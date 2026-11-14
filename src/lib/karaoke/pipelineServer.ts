import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import type { ReviewStatus } from "./types";
import { buildKaraokeSongFromAlign, type AlignResultIn } from "./buildSong";
import {
  describePipeline,
  flagUncertainTokens,
  type PipelineInput,
  type PipelineJob,
} from "./pipeline";
import { ALIGN_DIR, ensureKaraokeDirs } from "./store";

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

/** Execute Demucs + stable-whisper forced alignment (CPU; may take minutes). Server-only. */
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
