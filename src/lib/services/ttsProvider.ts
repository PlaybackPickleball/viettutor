/**
 * Server-only natural Vietnamese TTS via OpenAI audio/speech.
 * Prefer gpt-4o-mini-tts (expressive) with tts-1-hd fallback.
 */

import { DIGRAPH_GRAPHEMES, LETTER_PHONETIC_HINTS } from "@/lib/letters";

export function isTtsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

const MAX_CHARS = 500;

export type TtsResult =
  | { ok: true; audio: ArrayBuffer; contentType: string }
  | { ok: false; message: string; status?: number };

/**
 * Letter/digraph cues only. Open syllables like "ba"/"bò" must not pick up
 * digraph hints just because `length <= 2`.
 */
function resolvePhoneticHint(text: string, hint?: string): string | undefined {
  if (hint?.trim()) return hint.trim();
  const trimmed = text.trim().normalize("NFC");
  if (!trimmed) return undefined;
  if (LETTER_PHONETIC_HINTS[trimmed]) return LETTER_PHONETIC_HINTS[trimmed];
  const lower = trimmed.toLocaleLowerCase("vi");
  if (LETTER_PHONETIC_HINTS[lower]) return LETTER_PHONETIC_HINTS[lower];
  if ((DIGRAPH_GRAPHEMES as readonly string[]).includes(lower)) {
    return LETTER_PHONETIC_HINTS[lower];
  }
  return undefined;
}

/**
 * For models without instruction support, nudge look-alike letters toward the
 * correct Southern Vietnamese sound without inventing non-Vietnamese text.
 * Prefer the bare grapheme when possible; only expand when necessary.
 */
function fallbackSpeakInput(text: string, phoneticHint?: string): string {
  const t = text.trim();
  if (t === "ă" || phoneticHint?.includes("ă (a with breve)")) {
    // Carrier keeps the breve vowel; model often drops bare ă → a.
    return "ă. ă.";
  }
  if (t === "â") return "â. â.";
  if (t === "ơ") return "ơ. ơ.";
  if (t === "ư") return "ư. ư.";
  if (t === "ê") return "ê. ê.";
  if (t === "ô") return "ô. ô.";
  if (t === "đ") return "đ. đ.";
  return t;
}

export async function synthesizeVietnameseSpeech(
  text: string,
  opts?: { slow?: boolean; phoneticHint?: string },
): Promise<TtsResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { ok: false, message: "OPENAI_API_KEY not configured", status: 503 };
  }

  const input = text.trim().slice(0, MAX_CHARS);
  if (!input) {
    return { ok: false, message: "Empty text", status: 400 };
  }

  const phoneticHint = resolvePhoneticHint(input, opts?.phoneticHint);
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const voice = process.env.OPENAI_TTS_VOICE || "coral";
  const primaryModel = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const speed = opts?.slow ? 0.85 : 1;

  const letterLine = phoneticHint
    ? ` Critical letter cue: ${phoneticHint} Speak only the Vietnamese text given — do not translate to English.`
    : "";

  const instructions = opts?.slow
    ? `Speak clear Southern Vietnamese (giọng Nam), warm female language tutor. Slow and deliberate so a beginner can catch every tone mark. Natural and human, never robotic.${letterLine}`
    : `Speak natural Southern Vietnamese (giọng Nam), warm female language tutor. Conversational and human — clear tones, soft and friendly, never robotic or metallic.${letterLine}`;

  const primary = await requestSpeech(base, key, {
    model: primaryModel,
    voice,
    input,
    instructions,
    speed,
  });
  if (primary.ok) return primary;

  // Older accounts / base URLs may not support mini-tts + instructions
  return requestSpeech(base, key, {
    model: "tts-1-hd",
    voice: process.env.OPENAI_TTS_FALLBACK_VOICE || "nova",
    input: fallbackSpeakInput(input, phoneticHint),
    speed,
  });
}

async function requestSpeech(
  base: string,
  key: string,
  body: {
    model: string;
    voice: string;
    input: string;
    instructions?: string;
    speed?: number;
  },
): Promise<TtsResult> {
  const payload: Record<string, unknown> = {
    model: body.model,
    voice: body.voice,
    input: body.input,
    response_format: "mp3",
  };
  if (body.instructions && body.model.includes("gpt-4o")) {
    payload.instructions = body.instructions;
  }
  if (typeof body.speed === "number" && body.model.startsWith("tts-")) {
    payload.speed = body.speed;
  }

  try {
    const res = await fetch(`${base}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        ok: false,
        message: `TTS provider error (${res.status}): ${errText.slice(0, 200)}`,
        status: res.status >= 500 ? 502 : 400,
      };
    }

    const audio = await res.arrayBuffer();
    if (!audio.byteLength) {
      return { ok: false, message: "Empty audio from TTS provider", status: 502 };
    }
    return { ok: true, audio, contentType: "audio/mpeg" };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "TTS request failed",
      status: 502,
    };
  }
}

export const TTS_MAX_CHARS = MAX_CHARS;
