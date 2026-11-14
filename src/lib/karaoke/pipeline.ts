import type { AlignmentReview, KaraokeSong, ReviewStatus } from "./types";

/**
 * Client-safe karaoke pipeline helpers.
 * Heavy Demucs / forced-align execution lives in `pipelineServer.ts` (API routes only).
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
