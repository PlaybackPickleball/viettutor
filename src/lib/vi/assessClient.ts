import type { ViPronunciationFeedback } from "./feedback";
import { feedbackUnavailable } from "./feedback";
import { blobToBase64, blobToWavBlob } from "./wavEncode";

export type ViAssessClientResult = ViPronunciationFeedback & {
  itemId?: string | null;
  dialect?: "southern" | "northern";
};

async function deepgramReady(): Promise<boolean> {
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
 * Client helper: re-encode to WAV when needed, POST to backend Deepgram assess.
 * Never invents pronunciation scores — returns match / no-match only.
 */
export async function assessVietnamesePronunciation(args: {
  expected: string;
  mime: string;
  audio: Blob;
  itemId?: string;
  dialect?: "southern" | "northern";
}): Promise<ViAssessClientResult> {
  const configured = await deepgramReady();
  if (!configured) {
    return feedbackUnavailable(
      "Deepgram Vietnamese transcription is not configured. Recording and playback still work — we will not invent a score.",
      "unavailable",
      args.expected,
    );
  }

  let mime = args.mime;
  let audio = args.audio;
  const lower = mime.toLowerCase();
  const ready =
    lower.includes("audio/wav") ||
    lower.includes("audio/wave") ||
    lower.includes("audio/ogg") ||
    lower.includes("audio/opus") ||
    lower.includes("audio/mpeg") ||
    lower.includes("audio/mp3") ||
    lower.includes("audio/webm") ||
    lower.includes("audio/mp4");

  if (!ready || lower.includes("audio/webm") || lower.includes("audio/mp4")) {
    try {
      audio = await blobToWavBlob(args.audio);
      mime = "audio/wav";
    } catch {
      if (!ready) {
        return feedbackUnavailable(
          "Unable to assess reliably — this browser audio format could not be converted. Compare by ear, then try again.",
          "format_unsupported",
          args.expected,
        );
      }
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
        "unavailable",
        args.expected,
      );
    }
    if (!res.ok) {
      return feedbackUnavailable(
        "Unable to assess reliably — please try again.",
        "unavailable",
        args.expected,
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
        args.expected,
      );
    }
    return data.feedback;
  } catch {
    return feedbackUnavailable(
      "Unable to assess reliably — please try again.",
      "unavailable",
      args.expected,
    );
  }
}
