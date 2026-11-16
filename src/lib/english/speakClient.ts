import { replayRate } from "./a11y";

type RecResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type RecInstance = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: RecResult) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function recognitionCtor(): (new () => RecInstance) | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: new () => RecInstance;
    webkitSpeechRecognition?: new () => RecInstance;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function englishRecognitionAvailable(): boolean {
  return recognitionCtor() != null;
}

/** Browser transcript for the same moment as the recording. Null when the browser cannot transcribe. */
export function captureEnglishTranscript(): { stop: () => Promise<string | null> } {
  const Ctor = recognitionCtor();
  if (!Ctor) return { stop: async () => null };
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  let text = "";
  let failed = false;
  rec.onresult = (event) => {
    text = event.results?.[0]?.[0]?.transcript ?? text;
  };
  rec.onerror = () => {
    failed = true;
  };
  try {
    rec.start();
  } catch {
    return { stop: async () => null };
  }
  return {
    stop: () =>
      new Promise((resolve) => {
        const finish = () => resolve(failed ? text || null : text || null);
        rec.onend = finish;
        try {
          rec.stop();
        } catch {
          finish();
        }
        setTimeout(finish, 700);
      }),
  };
}

/** Drop punctuation so a tapped token is spoken as a word. */
export function speakableEnglish(text: string): string {
  const cleaned = text.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "");
  return cleaned || text.trim();
}

function voicesReady(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const existing = synth.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const finish = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 400);
  });
}

export async function speakEnglish(text: string, slow = false): Promise<"en-US" | "english" | "missing"> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("Speech synthesis unavailable");
  }
  const synth = window.speechSynthesis;
  const voices = await voicesReady(synth);
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  const american = voices.find((voice) => voice.lang.toLowerCase() === "en-us");
  const english = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (american) utter.voice = american;
  else if (english) utter.voice = english;
  utter.rate = replayRate(slow);
  if (synth.speaking || synth.pending) {
    synth.cancel();
    await new Promise((resolve) => window.setTimeout(resolve, 60));
  }
  await new Promise<void>((resolve, reject) => {
    utter.onend = () => resolve();
    utter.onerror = (event) => {
      const code = "error" in event ? String(event.error) : "";
      if (code === "interrupted" || code === "canceled") {
        resolve();
        return;
      }
      reject(new Error("Speech failed"));
    };
    synth.speak(utter);
  });
  if (american) return "en-US";
  if (english) return "english";
  return "missing";
}

export function stopEnglishSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
