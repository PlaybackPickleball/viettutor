/**
 * Azure Speech Pronunciation Assessment for Vietnamese (vi-VN).
 * Subscription key stays server-side only.
 */

export function vietnamesePronunciationConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

export function isAzureAudioMime(mime: string): boolean {
  const value = mime.toLowerCase();
  return (
    value.includes("audio/wav") ||
    value.includes("audio/wave") ||
    value.includes("audio/ogg") ||
    value.includes("audio/opus") ||
    value.includes("audio/mpeg") ||
    value.includes("audio/mp3")
  );
}

/**
 * Azure short-audio pronunciation assessment for vi-VN.
 * Does not invent scores — returns raw provider JSON for parsing.
 */
export async function callAzureVietnamesePronunciation(args: {
  audio: ArrayBuffer | Uint8Array;
  mime: string;
  reference: string;
}): Promise<{ httpOk: boolean; body: unknown }> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Azure speech is not configured");
  }
  if (!isAzureAudioMime(args.mime)) {
    throw new Error("Audio format is not supported for Vietnamese pronunciation scoring");
  }

  const reference = args.reference.trim().slice(0, 400);
  const payload = Buffer.from(
    JSON.stringify({
      ReferenceText: reference,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true,
    }),
  ).toString("base64");

  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=vi-VN&format=detailed`;
  const bytes = args.audio instanceof Uint8Array ? args.audio : new Uint8Array(args.audio);
  const audioBody = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": args.mime.split(";")[0]!.trim() || args.mime,
      "Pronunciation-Assessment": payload,
      Accept: "application/json",
    },
    body: audioBody,
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { httpOk: response.ok, body };
}
