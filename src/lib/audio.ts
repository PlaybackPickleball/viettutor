/** Web Speech TTS helpers — Southern Vietnamese preferred when available. */

function pickVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const vi =
    voices.find((v) => v.lang.toLowerCase().startsWith("vi") && /south|nam|female|linh|my/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase() === "vi-vn") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("vi"));
  return vi ?? null;
}

export function speakVietnamese(text: string, opts?: { rate?: number; slow?: boolean }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis unavailable"));
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    const voice = pickVietnameseVoice();
    if (voice) utter.voice = voice;
    utter.rate = opts?.slow ? 0.72 : (opts?.rate ?? 0.9);
    utter.pitch = 1;

    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("Speech failed"));

    // Chrome often needs voices loaded asynchronously
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
      // Fallback if event never fires
      setTimeout(run, 200);
    } else {
      run();
    }
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
