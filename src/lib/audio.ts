/** Vietnamese TTS — natural OpenAI voice when available, Web Speech fallback. */

import { LETTER_PHONETIC_HINTS } from "@/lib/letters";

type SpeakOpts = {
  rate?: number;
  slow?: boolean;
  /** Extra cue so look-alike letters (ă vs a) are spoken correctly. */
  phoneticHint?: string;
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

function resolveHint(text: string, hint?: string): string | undefined {
  if (hint?.trim()) return hint.trim();
  const t = text.trim();
  if (t.length <= 2) {
    return LETTER_PHONETIC_HINTS[t.toLowerCase()] ?? LETTER_PHONETIC_HINTS[t];
  }
  return undefined;
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
      reject(new Error("Cloud TTS playback failed"));
    };
    void audio.play().catch(reject);
  });
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
 * Prefer natural OpenAI Southern-Vietnamese TTS; fall back to browser Web Speech.
 */
export async function speakVietnamese(text: string, opts?: SpeakOpts): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  try {
    const ok = await speakWithCloudTts(trimmed, opts);
    if (ok) return;
  } catch {
    /* fall through to browser voice */
  }

  return speakWithWebSpeech(trimmed, opts);
}

export function stopSpeaking() {
  stopCloudAudio();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
