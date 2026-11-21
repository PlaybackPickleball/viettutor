/** Vietnamese TTS — native file when verified, else OpenAI voice, else Web Speech. */

import { DIGRAPH_GRAPHEMES, LETTER_PHONETIC_HINTS } from "@/lib/letters";

type SpeakOpts = {
  rate?: number;
  slow?: boolean;
  /** Extra cue so look-alike letters (ă vs a) are spoken correctly. */
  phoneticHint?: string;
  /**
   * Optional native recording under /public (e.g. /audio/vi/south/syllable/ba.mp3).
   * Tried first when preferNative is true; 404 → TTS placeholder (never silent “verified”).
   */
  nativePath?: string | null;
  /** Default true when nativePath is set. */
  preferNative?: boolean;
};

let cloudAudio: HTMLAudioElement | null = null;
const cloudCache = new Map<string, string>(); // key → object URL
const CACHE_MAX = 48;

function cacheKey(text: string, slow?: boolean, hint?: string): string {
  return `${slow ? "s" : "n"}:${text.trim()}|${hint?.trim() ?? ""}`;
}

function rememberUrl(key: string, url: string) {
  if (cloudCache.has(key)) {
    URL.revokeObjectURL(cloudCache.get(key)!);
  }
  cloudCache.set(key, url);
  while (cloudCache.size > CACHE_MAX) {
    const oldest = cloudCache.keys().next().value;
    if (!oldest) break;
    const oldUrl = cloudCache.get(oldest);
    cloudCache.delete(oldest);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
  }
}

function stopCloudAudio() {
  if (!cloudAudio) return;
  try {
    cloudAudio.pause();
    cloudAudio.removeAttribute("src");
    cloudAudio.load();
  } catch {
    /* */
  }
  cloudAudio = null;
}

/**
 * Letter/digraph cues only — never treat open syllables like "ba"/"bò" as digraphs
 * just because string length ≤ 2.
 */
export function resolvePhoneticHintForSpeech(
  text: string,
  hint?: string,
): string | undefined {
  if (hint?.trim()) return hint.trim();
  const t = text.trim().normalize("NFC");
  if (!t) return undefined;
  if (LETTER_PHONETIC_HINTS[t]) return LETTER_PHONETIC_HINTS[t];
  const lower = t.toLocaleLowerCase("vi");
  if (LETTER_PHONETIC_HINTS[lower]) return LETTER_PHONETIC_HINTS[lower];
  if ((DIGRAPH_GRAPHEMES as readonly string[]).includes(lower)) {
    return LETTER_PHONETIC_HINTS[lower];
  }
  return undefined;
}

function resolveHint(text: string, hint?: string): string | undefined {
  return resolvePhoneticHintForSpeech(text, hint);
}

async function playObjectUrl(url: string, opts?: SpeakOpts): Promise<void> {
  stopCloudAudio();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const audio = new Audio(url);
  cloudAudio = audio;
  if (!opts?.slow && opts?.rate && opts.rate > 0) {
    audio.playbackRate = Math.min(1.25, Math.max(0.75, opts.rate));
  }

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      if (cloudAudio === audio) cloudAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (cloudAudio === audio) cloudAudio = null;
      reject(new Error("Audio playback failed"));
    };
    void audio.play().catch(reject);
  });
}

/** Probe a public native file; returns false on 404 / network error. */
export async function nativeAudioAvailable(nativePath: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(nativePath, { method: "HEAD", cache: "force-cache" });
    if (res.ok) return true;
    // Some hosts reject HEAD — try a tiny ranged GET
    const get = await fetch(nativePath, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "force-cache",
    });
    return get.ok || get.status === 206;
  } catch {
    return false;
  }
}

async function speakWithNativeFile(nativePath: string, opts?: SpeakOpts): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const available = await nativeAudioAvailable(nativePath);
  if (!available) return false;
  try {
    await playObjectUrl(nativePath, opts);
    return true;
  } catch {
    return false;
  }
}

async function speakWithCloudTts(text: string, opts?: SpeakOpts): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const phoneticHint = resolveHint(text, opts?.phoneticHint);
  const key = cacheKey(text, opts?.slow, phoneticHint);
  let url = cloudCache.get(key);

  if (!url) {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        slow: Boolean(opts?.slow),
        phoneticHint: phoneticHint ?? null,
      }),
    });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("audio")) return false;
    const blob = await res.blob();
    if (!blob.size) return false;
    url = URL.createObjectURL(blob);
    rememberUrl(key, url);
  }

  await playObjectUrl(url, opts);
  return true;
}

function pickVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const vi =
    voices.find((v) => v.lang.toLowerCase().startsWith("vi") && /south|nam|female|linh|my/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase() === "vi-vn") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("vi"));
  return vi ?? null;
}

/** Web Speech often flattens ă→a; repeat the grapheme with a native word cue softly avoided — speak grapheme twice. */
function webSpeechText(text: string): string {
  const t = text.trim();
  if (t === "ă") return "ă, ă";
  if (t === "â") return "â, â";
  if (t === "ơ") return "ơ, ơ";
  if (t === "ư") return "ư, ư";
  return t;
}

function speakWithWebSpeech(text: string, opts?: SpeakOpts): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis unavailable"));
      return;
    }

    const utter = new SpeechSynthesisUtterance(webSpeechText(text));
    utter.lang = "vi-VN";
    const voice = pickVietnameseVoice();
    if (voice) utter.voice = voice;
    utter.rate = opts?.slow ? 0.72 : (opts?.rate ?? 0.9);
    utter.pitch = 1;

    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("Speech failed"));

    const run = () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const v = pickVietnameseVoice();
        if (v) utter.voice = v;
        run();
      };
      setTimeout(run, 200);
    } else {
      run();
    }
  });
}

/**
 * Prefer verified native file → natural OpenAI Southern TTS → browser Web Speech.
 * Never invents silence as a “verified” native take.
 */
export async function speakVietnamese(text: string, opts?: SpeakOpts): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed && !opts?.nativePath) return;

  const preferNative = opts?.preferNative !== false && Boolean(opts?.nativePath?.trim());
  if (preferNative && opts?.nativePath) {
    try {
      const ok = await speakWithNativeFile(opts.nativePath.trim(), opts);
      if (ok) return;
    } catch {
      /* fall through — missing native is a TTS placeholder, not a fake verified file */
    }
  }

  if (trimmed) {
    try {
      const ok = await speakWithCloudTts(trimmed, opts);
      if (ok) return;
    } catch {
      /* fall through to browser voice */
    }
    return speakWithWebSpeech(trimmed, opts);
  }

  throw new Error("No audio source available");
}

export function stopSpeaking() {
  stopCloudAudio();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
