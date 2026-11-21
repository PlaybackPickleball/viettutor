/**
 * Deepgram Vietnamese transcription (server-side key only).
 * Used for recognized-text vs expected-word match — not pronunciation scores.
 */

export function deepgramConfigured(): boolean {
  return Boolean(process.env.DEEPGRAM_API_KEY?.trim());
}

/** Audio types Deepgram accepts for pre-recorded listen. */
export function isDeepgramAudioMime(mime: string): boolean {
  const value = mime.toLowerCase();
  return (
    value.includes("audio/wav") ||
    value.includes("audio/wave") ||
    value.includes("audio/ogg") ||
    value.includes("audio/opus") ||
    value.includes("audio/mpeg") ||
    value.includes("audio/mp3") ||
    value.includes("audio/webm") ||
    value.includes("audio/mp4") ||
    value.includes("audio/m4a")
  );
}

export type DeepgramListenResult = {
  httpOk: boolean;
  transcript: string | null;
  /** Provider confidence 0–1 when present — never shown as pronunciation accuracy. */
  confidence: number | null;
  raw: unknown;
};

/**
 * Pre-recorded listen for Vietnamese (vi).
 * Does not invent scores — returns transcript + optional confidence only.
 */
export async function callDeepgramVietnameseListen(args: {
  audio: ArrayBuffer | Uint8Array;
  mime: string;
}): Promise<DeepgramListenResult> {
  const key = process.env.DEEPGRAM_API_KEY?.trim();
  if (!key) {
    throw new Error("Deepgram is not configured");
  }
  if (!isDeepgramAudioMime(args.mime)) {
    throw new Error("Audio format is not supported for Deepgram transcription");
  }

  const contentType = args.mime.split(";")[0]!.trim() || "audio/wav";
  const bytes = args.audio instanceof Uint8Array ? args.audio : new Uint8Array(args.audio);
  const audioBody = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  // nova-2/nova-3 language=vi — diacritics preserved when the model returns them
  const url =
    "https://api.deepgram.com/v1/listen?model=nova-2&language=vi&smart_format=true&punctuate=false";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": contentType,
      Accept: "application/json",
    },
    body: audioBody,
  });

  let raw: unknown = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  if (!response.ok || !raw || typeof raw !== "object") {
    return { httpOk: response.ok, transcript: null, confidence: null, raw };
  }

  const alt = (
    raw as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: string; confidence?: number }>;
        }>;
      };
    }
  ).results?.channels?.[0]?.alternatives?.[0];

  const transcript =
    typeof alt?.transcript === "string" ? alt.transcript.trim() || null : null;
  const confidence =
    typeof alt?.confidence === "number" && Number.isFinite(alt.confidence)
      ? alt.confidence
      : null;

  return { httpOk: true, transcript, confidence, raw };
}

/** @deprecated Use deepgramConfigured — VI path no longer uses Azure. */
export function vietnamesePronunciationConfigured(): boolean {
  return deepgramConfigured();
}
