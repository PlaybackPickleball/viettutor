import type { ViPronunciationFeedback } from "./feedback";
import { feedbackUnavailable } from "./feedback";
import { blobToBase64, blobToWavBlob } from "./wavEncode";

export type ViAssessClientResult = ViPronunciationFeedback & {
  itemId?: string | null;
  dialect?: "southern" | "northern";
};

async function pronunciationConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/vi/status", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { pronunciation?: boolean };
    return Boolean(data.pronunciation);
  } catch {
    return false;
  }
}

/**
 * Client helper: re-encode to WAV when needed, POST to backend assess.
 * Never invents scores — unavailable paths return null quality feedback.
 */
export async function assessVietnamesePronunciation(args: {
  expected: string;
  mime: string;
  audio: Blob;
  itemId?: string;
  dialect?: "southern" | "northern";
}): Promise<ViAssessClientResult> {
  const configured = await pronunciationConfigured();
  if (!configured) {
    return feedbackUnavailable(
      "Azure Pronunciation Assessment for Vietnamese is not configured. Recording and playback still work — we will not invent a score.",
    );
  }

  let mime = args.mime;
  let audio = args.audio;
  const lower = mime.toLowerCase();
  const azureReady =
    lower.includes("audio/wav") ||
    lower.includes("audio/wave") ||
    lower.includes("audio/ogg") ||
    lower.includes("audio/opus") ||
    lower.includes("audio/mpeg") ||
    lower.includes("audio/mp3");

  if (!azureReady) {
    try {
      audio = await blobToWavBlob(args.audio);
      mime = "audio/wav";
    } catch {
      return feedbackUnavailable(
        "Unable to assess reliably — this browser audio format could not be converted for scoring. Compare by ear, then try again.",
        "format_unsupported",
      );
    }
  }

  try {
    const audioBase64 = await blobToBase64(audio);
    const res = await fetch("/api/vi/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expected: args.expected,
        mime,
        audioBase64,
        dialect: args.dialect ?? "southern",
        itemId: args.itemId ?? null,
      }),
    });
    if (res.status === 429) {
      return feedbackUnavailable(
        "Too many assessment attempts — wait a moment, then try again.",
      );
    }
    if (!res.ok) {
      return feedbackUnavailable(
        "Unable to assess reliably — please try again.",
        "unavailable",
      );
    }
    const data = (await res.json()) as {
      ok?: boolean;
      feedback?: ViAssessClientResult;
    };
    if (!data.ok || !data.feedback) {
      return feedbackUnavailable(
        "Unable to assess reliably — please try again.",
        "unavailable",
      );
    }
    return data.feedback;
  } catch {
    return feedbackUnavailable(
      "Unable to assess reliably — please try again.",
      "unavailable",
    );
  }
}
