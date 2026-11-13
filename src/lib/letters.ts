export type LetterId =
  | "a"
  | "a-breve"
  | "a-circumflex"
  | "e"
  | "e-circumflex"
  | "o"
  | "o-circumflex"
  | "o-horn"
  | "u"
  | "u-horn";

export type LetterLesson = {
  id: LetterId;
  grapheme: string;
  soundHint: string;
  /** IPA-ish hint for teachers; shown lightly in studio */
  ipa: string;
  wordVi: string;
  wordEn: string;
  /** Text spoken by Web Speech TTS (Southern-friendly phrasing) */
  listenText: string;
  wordListenText: string;
  order: number;
  /** Simplified stroke paths for demo + tracing guide (viewBox 0 0 200 240) */
  strokes: string[];
  /** Soft pastel scene color for sound–object illustration */
  sceneHue: string;
};

/** Level 1 alphabet subset — Southern Vietnamese first. */
export const LEVEL1_LETTERS: LetterLesson[] = [
  {
    id: "a",
    grapheme: "a",
    soundHint: "open “ah”",
    ipa: "/aː/",
    wordVi: "áo",
    wordEn: "shirt",
    listenText: "a",
    wordListenText: "áo",
    order: 1,
    strokes: ["M 40 40 C 70 20, 130 20, 160 55 C 185 85, 175 150, 100 200 C 55 230, 35 180, 55 120"],
    sceneHue: "#7eb8a8",
  },
  {
    id: "a-breve",
    grapheme: "ă",
    soundHint: "short “uh”",
    ipa: "/ă/",
    wordVi: "ăn",
    wordEn: "to eat",
    listenText: "ă",
    wordListenText: "ăn",
    order: 2,
    strokes: [
      "M 70 28 Q 100 8, 130 28",
      "M 40 55 C 70 35, 130 35, 160 70 C 185 100, 175 155, 100 205 C 55 235, 35 185, 55 125",
    ],
    sceneHue: "#c4a574",
  },
  {
    id: "a-circumflex",
    grapheme: "â",
    soundHint: "soft “uh” deeper",
    ipa: "/ɤ/",
    wordVi: "ấm",
    wordEn: "warm",
    listenText: "â",
    wordListenText: "ấm",
    order: 3,
    strokes: [
      "M 70 38 L 100 12 L 130 38",
      "M 40 58 C 70 38, 130 38, 160 73 C 185 103, 175 158, 100 208 C 55 238, 35 188, 55 128",
    ],
    sceneHue: "#e0b07a",
  },
  {
    id: "e",
    grapheme: "e",
    soundHint: "open “eh”",
    ipa: "/ɛ/",
    wordVi: "xe",
    wordEn: "vehicle",
    listenText: "e",
    wordListenText: "xe",
    order: 4,
    strokes: ["M 145 55 C 120 25, 55 35, 50 100 C 48 155, 95 195, 145 175"],
    sceneHue: "#6a9bb8",
  },
  {
    id: "e-circumflex",
    grapheme: "ê",
    soundHint: "closed “ay”",
    ipa: "/e/",
    wordVi: "ghế",
    wordEn: "chair",
    listenText: "ê",
    wordListenText: "ghế",
    order: 5,
    strokes: [
      "M 70 38 L 100 12 L 130 38",
      "M 145 62 C 120 32, 55 42, 50 107 C 48 162, 95 202, 145 182",
    ],
    sceneHue: "#8a9e6e",
  },
  {
    id: "o",
    grapheme: "o",
    soundHint: "round “aw”",
    ipa: "/ɔ/",
    wordVi: "bò",
    wordEn: "cow",
    listenText: "o",
    wordListenText: "bò",
    order: 6,
    strokes: ["M 100 45 C 155 45, 165 120, 100 195 C 35 120, 45 45, 100 45"],
    sceneHue: "#b8896a",
  },
  {
    id: "o-circumflex",
    grapheme: "ô",
    soundHint: "closed “oh”",
    ipa: "/o/",
    wordVi: "hồ",
    wordEn: "lake",
    listenText: "ô",
    wordListenText: "hồ",
    order: 7,
    strokes: [
      "M 70 32 L 100 8 L 130 32",
      "M 100 52 C 155 52, 165 125, 100 200 C 35 125, 45 52, 100 52",
    ],
    sceneHue: "#5f9eae",
  },
  {
    id: "o-horn",
    grapheme: "ơ",
    soundHint: "open “uh” with lips flat",
    ipa: "/ɤː/",
    wordVi: "mơ",
    wordEn: "dream",
    listenText: "ơ",
    wordListenText: "mơ",
    order: 8,
    strokes: [
      "M 148 28 L 168 48",
      "M 100 55 C 155 55, 165 125, 100 200 C 35 125, 45 55, 100 55",
    ],
    sceneHue: "#9b8ec4",
  },
  {
    id: "u",
    grapheme: "u",
    soundHint: "tight “oo”",
    ipa: "/u/",
    wordVi: "đu",
    wordEn: "swing",
    listenText: "u",
    wordListenText: "đu",
    order: 9,
    strokes: ["M 55 45 L 55 150 C 55 195, 145 195, 145 150 L 145 45"],
    sceneHue: "#c47a8a",
  },
  {
    id: "u-horn",
    grapheme: "ư",
    soundHint: "spread “eu”",
    ipa: "/ɯ/",
    wordVi: "chữ",
    wordEn: "letter / character",
    listenText: "ư",
    wordListenText: "chữ",
    order: 10,
    strokes: [
      "M 148 28 L 168 48",
      "M 55 55 L 55 155 C 55 200, 145 200, 145 155 L 145 55",
    ],
    sceneHue: "#5f8f7a",
  },
];

export function getLetter(id: string): LetterLesson | undefined {
  return LEVEL1_LETTERS.find((l) => l.id === id);
}

export function getNextLetter(id: string): LetterLesson | undefined {
  const current = getLetter(id);
  if (!current) return undefined;
  return LEVEL1_LETTERS.find((l) => l.order === current.order + 1);
}

/** One solid pass unlocks Write — short enough for a live demo; still shows a why-wrong tip on the first miss. */
export const MASTERY_SAY_STREAK = 1;
