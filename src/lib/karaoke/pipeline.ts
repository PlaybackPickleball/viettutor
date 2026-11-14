import type { AlignmentReview, KaraokeSong, ReviewStatus } from "./types";

/**
 * AI preprocessing pipeline — integration stubs.
 * Demucs / WhisperX / LLM run offline or via worker jobs.
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
};

/** Describe the offline pipeline without executing heavyweight models. */
export function describePipeline(): { step: PipelineStep; provider: string; note: string }[] {
  return [
    {
      step: "accept",
      provider: "admin",
      note: "Accept authorized audio + metadata + verified VI lyrics",
    },
    {
      step: "isolate_vocals",
      provider: "demucs (optional)",
      note: "Optional vocal stem for cleaner alignment",
    },
    {
      step: "forced_alignment",
      provider: "whisperx / VI-compatible aligner",
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
      provider: "chatJson / tutor LLM",
      note: "Contextual EN, line translations, vocab, tone labels",
    },
    {
      step: "flag_uncertain",
      provider: "heuristics",
      note: "Low confidence → AlignmentReview needs_review",
    },
    {
      step: "persist_json",
      provider: "DB / local fixture",
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

/** MVP: dry-run job record for admin UI — does not call Demucs/WhisperX. */
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
