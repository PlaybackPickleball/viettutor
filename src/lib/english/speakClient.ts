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

export async function speakEnglish(text: string, slow = false): Promise<"en-US" | "english" | "missing"> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("Speech synthesis unavailable");
  }
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  const voices = synth.getVoices();
  const american = voices.find((voice) => voice.lang.toLowerCase() === "en-us");
  const english = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (american) utter.voice = american;
  else if (english) utter.voice = english;
  utter.rate = replayRate(slow);
  synth.cancel();
  await new Promise<void>((resolve, reject) => {
    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("Speech failed"));
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
