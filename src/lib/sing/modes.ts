import type { SingMode } from "./types";

export const SING_MODES: {
  id: SingMode;
  label: string;
  hint: string;
}[] = [
  { id: "listen", label: "Listen", hint: "Follow the glow — seek, loop, and hear the song." },
  {
    id: "understand",
    label: "Understand",
    hint: "Line lesson: meaning, translation, and word structure.",
  },
  { id: "sing", label: "Sing", hint: "Karaoke practice — pitch is not a tone score." },
  { id: "speak", label: "Speak", hint: "Music off — speak clearly; compare with TTS." },
  { id: "improve", label: "Improve", hint: "Review saved words and retry weak phrases." },
];

export function normalizeStoredMode(raw: string | undefined): SingMode | undefined {
  if (!raw) return undefined;
  if (raw === "words") return "understand";
  if (raw === "vocab") return "improve";
  if (
    raw === "listen" ||
    raw === "understand" ||
    raw === "sing" ||
    raw === "speak" ||
    raw === "improve"
  ) {
    return raw;
  }
  return undefined;
}
