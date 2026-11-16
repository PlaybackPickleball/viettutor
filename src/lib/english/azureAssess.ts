import { isAzureAudioMime } from "./feedback";

export function englishPhonemeConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

/**
 * Azure short-audio pronunciation assessment for en-US.
 * Caller must already reject unsupported browser mime types.
 * The subscription key stays in this server process.
 */
export async function callAzurePronunciation(args: {
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
    throw new Error("Audio format is not supported for phoneme scoring");
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

  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;
  const bytes = args.audio instanceof Uint8Array ? args.audio : new Uint8Array(args.audio);
  const audioBody = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": args.mime,
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
