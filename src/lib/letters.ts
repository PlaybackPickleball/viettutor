export type LetterId = string;

export type LetterLesson = {
  id: LetterId;
  grapheme: string;
  soundHint: string;
  ipa: string;
  wordVi: string;
  wordEn: string;
  listenText: string;
  wordListenText: string;
  /** Global curriculum order */
  order: number;
  levelId: number;
  strokes: string[];
  sceneHue: string;
};

export type LevelDef = {
  id: number;
  title: string;
  subtitle: string;
};

/** ~4–5 letters per level — Southern Vietnamese first. */
export const LEVELS: LevelDef[] = [
  { id: 1, title: "Open vowels", subtitle: "a · ă · â · e · ê" },
  { id: 2, title: "Close & round", subtitle: "i · y · o · ô · ơ" },
  { id: 3, title: "Back vowels & lips", subtitle: "u · ư · b · p · m" },
  { id: 4, title: "Lips & tip", subtitle: "ph · v · t · th · đ" },
  { id: 5, title: "Nose & hard sounds", subtitle: "d · n · c · k · kh" },
  { id: 6, title: "Back & soft", subtitle: "g · ng · nh · h · l" },
  { id: 7, title: "Flow & hiss", subtitle: "r · s · x · tr · ch" },
  { id: 8, title: "Blends", subtitle: "qu · gi · gh" },
];

const S = {
  a: ["M 40 40 C 70 20, 130 20, 160 55 C 185 85, 175 150, 100 200 C 55 230, 35 180, 55 120"],
  breveA: [
    "M 70 28 Q 100 8, 130 28",
    "M 40 55 C 70 35, 130 35, 160 70 C 185 100, 175 155, 100 205 C 55 235, 35 185, 55 125",
  ],
  hatA: [
    "M 70 38 L 100 12 L 130 38",
    "M 40 58 C 70 38, 130 38, 160 73 C 185 103, 175 158, 100 208 C 55 238, 35 188, 55 128",
  ],
  e: ["M 145 55 C 120 25, 55 35, 50 100 C 48 155, 95 195, 145 175"],
  hatE: [
    "M 70 38 L 100 12 L 130 38",
    "M 145 62 C 120 32, 55 42, 50 107 C 48 162, 95 202, 145 182",
  ],
  o: ["M 100 45 C 155 45, 165 120, 100 195 C 35 120, 45 45, 100 45"],
  hatO: [
    "M 70 32 L 100 8 L 130 32",
    "M 100 52 C 155 52, 165 125, 100 200 C 35 125, 45 52, 100 52",
  ],
  hornO: [
    "M 148 28 L 168 48",
    "M 100 55 C 155 55, 165 125, 100 200 C 35 125, 45 55, 100 55",
  ],
  u: ["M 55 45 L 55 150 C 55 195, 145 195, 145 150 L 145 45"],
  hornU: [
    "M 148 28 L 168 48",
    "M 55 55 L 55 155 C 55 200, 145 200, 145 155 L 145 55",
  ],
  i: ["M 100 40 L 100 180", "M 100 28 L 100 32"],
  y: ["M 55 40 L 100 140 L 145 40", "M 100 140 L 100 200"],
  b: ["M 55 40 L 55 200", "M 55 40 C 140 40, 140 110, 55 110", "M 55 110 C 150 110, 150 200, 55 200"],
  p: ["M 55 60 L 55 220", "M 55 60 C 145 60, 145 140, 55 140"],
  m: ["M 40 200 L 40 80 C 40 50, 70 45, 85 80 L 100 140 L 115 80 C 130 45, 160 50, 160 80 L 160 200"],
  ph: ["M 50 60 L 50 200", "M 50 60 C 130 60, 130 130, 50 130", "M 70 40 L 95 55"],
  v: ["M 50 50 L 100 200 L 150 50"],
  t: ["M 50 50 L 150 50", "M 100 50 L 100 200"],
  th: ["M 45 55 L 155 55", "M 100 55 L 100 200", "M 70 35 L 95 50"],
  dStroke: ["M 55 40 L 55 200", "M 55 40 C 160 40, 160 200, 55 200"],
  dBar: [
    "M 40 70 L 70 70",
    "M 55 40 L 55 200",
    "M 55 40 C 160 40, 160 200, 55 200",
  ],
  n: ["M 50 200 L 50 70 C 50 50, 90 50, 110 90 L 130 160", "M 130 70 L 130 200"],
  c: ["M 155 70 C 130 35, 55 45, 50 120 C 48 180, 110 210, 155 175"],
  k: ["M 55 40 L 55 200", "M 55 120 L 145 40", "M 55 120 L 145 200"],
  kh: ["M 50 40 L 50 200", "M 50 120 L 140 40", "M 50 120 L 140 200", "M 70 30 L 95 48"],
  g: ["M 150 70 C 125 35, 50 50, 50 120 C 50 185, 115 215, 155 175 L 155 120 L 110 120"],
  ng: [
    "M 35 200 L 35 80 C 35 55, 70 50, 85 90 L 100 150",
    "M 100 80 L 100 200",
    "M 130 70 C 110 40, 70 55, 75 110 C 80 160, 125 175, 150 145",
  ],
  nh: [
    "M 40 200 L 40 75 C 40 55, 75 50, 95 95 L 110 160",
    "M 110 75 L 110 200",
    "M 130 40 L 155 55",
  ],
  h: ["M 55 40 L 55 200", "M 145 40 L 145 200", "M 55 120 L 145 120"],
  l: ["M 70 40 L 70 180 C 70 210, 140 210, 150 170"],
  r: ["M 55 200 L 55 60 C 55 40, 130 40, 130 90 C 130 125, 80 130, 55 130", "M 90 130 L 145 200"],
  s: ["M 140 70 C 120 40, 60 45, 60 85 C 60 120, 140 115, 140 155 C 140 195, 70 205, 55 175"],
  x: ["M 50 50 L 150 200", "M 150 50 L 50 200"],
  tr: [
    "M 40 50 L 100 50",
    "M 70 50 L 70 200",
    "M 110 200 L 110 70 C 110 50, 150 50, 155 95 C 158 125, 130 130, 110 130",
    "M 130 130 L 160 200",
  ],
  ch: [
    "M 40 70 C 40 40, 90 35, 100 80 L 100 200",
    "M 100 70 C 100 40, 155 40, 155 90 C 155 130, 115 135, 100 135",
  ],
  qu: [
    "M 90 50 C 150 50, 160 130, 90 200 C 30 130, 40 50, 90 50",
    "M 120 160 L 155 205",
    "M 165 45 L 165 150 C 165 190, 210 190, 210 150 L 210 45",
  ],
  gi: [
    "M 70 50 C 40 50, 35 120, 70 160 C 95 185, 70 210, 50 195",
    "M 120 45 L 120 180",
    "M 120 30 L 120 34",
  ],
  gh: [
    "M 90 55 C 55 40, 30 80, 40 125 C 50 175, 100 190, 125 155 L 125 110 L 85 110",
    "M 150 40 L 150 200",
    "M 150 110 L 195 110",
  ],
};

function L(
  partial: Omit<LetterLesson, "listenText" | "wordListenText"> & {
    listenText?: string;
    wordListenText?: string;
  },
): LetterLesson {
  return {
    listenText: partial.listenText ?? partial.grapheme,
    wordListenText: partial.wordListenText ?? partial.wordVi,
    ...partial,
  };
}

/** Full Level 1–8 alphabet path (vowels + consonants). */
export const ALL_LETTERS: LetterLesson[] = [
  // Level 1 — Open vowels
  L({
    id: "a",
    grapheme: "a",
    soundHint: "open “ah”",
    ipa: "/aː/",
    wordVi: "áo",
    wordEn: "shirt",
    order: 1,
    levelId: 1,
    strokes: S.a,
    sceneHue: "#7eb8a8",
  }),
  L({
    id: "a-breve",
    grapheme: "ă",
    soundHint: "short “uh”",
    ipa: "/ă/",
    wordVi: "ăn",
    wordEn: "to eat",
    order: 2,
    levelId: 1,
    strokes: S.breveA,
    sceneHue: "#c4a574",
  }),
  L({
    id: "a-circumflex",
    grapheme: "â",
    soundHint: "soft deeper “uh”",
    ipa: "/ɤ/",
    wordVi: "ấm",
    wordEn: "warm",
    order: 3,
    levelId: 1,
    strokes: S.hatA,
    sceneHue: "#e0b07a",
  }),
  L({
    id: "e",
    grapheme: "e",
    soundHint: "open “eh”",
    ipa: "/ɛ/",
    wordVi: "xe",
    wordEn: "vehicle",
    order: 4,
    levelId: 1,
    strokes: S.e,
    sceneHue: "#6a9bb8",
  }),
  L({
    id: "e-circumflex",
    grapheme: "ê",
    soundHint: "closed “ay”",
    ipa: "/e/",
    wordVi: "ghế",
    wordEn: "chair",
    order: 5,
    levelId: 1,
    strokes: S.hatE,
    sceneHue: "#8a9e6e",
  }),

  // Level 2 — Close & round
  L({
    id: "i",
    grapheme: "i",
    soundHint: "bright “ee”",
    ipa: "/i/",
    wordVi: "chim",
    wordEn: "bird",
    order: 6,
    levelId: 2,
    strokes: S.i,
    sceneHue: "#6aa8c4",
  }),
  L({
    id: "y",
    grapheme: "y",
    soundHint: "same as i in many words",
    ipa: "/i/",
    wordVi: "yên",
    wordEn: "peaceful",
    order: 7,
    levelId: 2,
    strokes: S.y,
    sceneHue: "#8bb5a0",
  }),
  L({
    id: "o",
    grapheme: "o",
    soundHint: "round “aw”",
    ipa: "/ɔ/",
    wordVi: "bò",
    wordEn: "cow",
    order: 8,
    levelId: 2,
    strokes: S.o,
    sceneHue: "#b8896a",
  }),
  L({
    id: "o-circumflex",
    grapheme: "ô",
    soundHint: "closed “oh”",
    ipa: "/o/",
    wordVi: "hồ",
    wordEn: "lake",
    order: 9,
    levelId: 2,
    strokes: S.hatO,
    sceneHue: "#5f9eae",
  }),
  L({
    id: "o-horn",
    grapheme: "ơ",
    soundHint: "open “uh”, lips flat",
    ipa: "/ɤː/",
    wordVi: "mơ",
    wordEn: "dream",
    order: 10,
    levelId: 2,
    strokes: S.hornO,
    sceneHue: "#9b8ec4",
  }),

  // Level 3 — Back vowels & lips
  L({
    id: "u",
    grapheme: "u",
    soundHint: "tight “oo”",
    ipa: "/u/",
    wordVi: "đu",
    wordEn: "swing",
    order: 11,
    levelId: 3,
    strokes: S.u,
    sceneHue: "#c47a8a",
  }),
  L({
    id: "u-horn",
    grapheme: "ư",
    soundHint: "spread “eu”",
    ipa: "/ɯ/",
    wordVi: "chữ",
    wordEn: "letter / character",
    order: 12,
    levelId: 3,
    strokes: S.hornU,
    sceneHue: "#5f8f7a",
  }),
  L({
    id: "b",
    grapheme: "b",
    soundHint: "soft b (light)",
    ipa: "/ɓ/",
    wordVi: "bé",
    wordEn: "child",
    order: 13,
    levelId: 3,
    strokes: S.b,
    sceneHue: "#d4a0a8",
  }),
  L({
    id: "p",
    grapheme: "p",
    soundHint: "puff of air",
    ipa: "/p/",
    wordVi: "pin",
    wordEn: "battery",
    order: 14,
    levelId: 3,
    strokes: S.p,
    sceneHue: "#a8b8d0",
  }),
  L({
    id: "m",
    grapheme: "m",
    soundHint: "humming lips",
    ipa: "/m/",
    wordVi: "mẹ",
    wordEn: "mother",
    order: 15,
    levelId: 3,
    strokes: S.m,
    sceneHue: "#c9a06e",
  }),

  // Level 4 — Lips & tip
  L({
    id: "ph",
    grapheme: "ph",
    soundHint: "like English f",
    ipa: "/f/",
    wordVi: "phở",
    wordEn: "noodle soup",
    order: 16,
    levelId: 4,
    strokes: S.ph,
    sceneHue: "#d4b07a",
  }),
  L({
    id: "v",
    grapheme: "v",
    soundHint: "soft v / w feel in South",
    ipa: "/v/",
    wordVi: "vui",
    wordEn: "happy",
    order: 17,
    levelId: 4,
    strokes: S.v,
    sceneHue: "#8ab89a",
  }),
  L({
    id: "t",
    grapheme: "t",
    soundHint: "unaspirated t",
    ipa: "/t/",
    wordVi: "tay",
    wordEn: "hand",
    order: 18,
    levelId: 4,
    strokes: S.t,
    sceneHue: "#7aa8c4",
  }),
  L({
    id: "th",
    grapheme: "th",
    soundHint: "aspirated t (puff)",
    ipa: "/tʰ/",
    wordVi: "thỏ",
    wordEn: "rabbit",
    order: 19,
    levelId: 4,
    strokes: S.th,
    sceneHue: "#c4a88a",
  }),
  L({
    id: "d-bar",
    grapheme: "đ",
    soundHint: "d with a crossbar",
    ipa: "/ɗ/",
    wordVi: "đèn",
    wordEn: "lamp",
    order: 20,
    levelId: 4,
    strokes: S.dBar,
    sceneHue: "#e0b070",
  }),

  // Level 5 — Nose & hard
  L({
    id: "d",
    grapheme: "d",
    soundHint: "like z / y in South",
    ipa: "/z~j/",
    wordVi: "da",
    wordEn: "skin",
    order: 21,
    levelId: 5,
    strokes: S.dStroke,
    sceneHue: "#b89a7a",
  }),
  L({
    id: "n",
    grapheme: "n",
    soundHint: "tongue-tip n",
    ipa: "/n/",
    wordVi: "nón",
    wordEn: "hat",
    order: 22,
    levelId: 5,
    strokes: S.n,
    sceneHue: "#9ab87a",
  }),
  L({
    id: "c",
    grapheme: "c",
    soundHint: "hard k (before a, o, u)",
    ipa: "/k/",
    wordVi: "cá",
    wordEn: "fish",
    order: 23,
    levelId: 5,
    strokes: S.c,
    sceneHue: "#6a9ec4",
  }),
  L({
    id: "k",
    grapheme: "k",
    soundHint: "hard k (before e, i)",
    ipa: "/k/",
    wordVi: "kem",
    wordEn: "ice cream",
    order: 24,
    levelId: 5,
    strokes: S.k,
    sceneHue: "#c47a9a",
  }),
  L({
    id: "kh",
    grapheme: "kh",
    soundHint: "scratchy kh",
    ipa: "/x/",
    wordVi: "khế",
    wordEn: "starfruit",
    order: 25,
    levelId: 5,
    strokes: S.kh,
    sceneHue: "#a8c47a",
  }),

  // Level 6 — Back & soft
  L({
    id: "g",
    grapheme: "g",
    soundHint: "hard g (before a, o, u)",
    ipa: "/ɣ/",
    wordVi: "gà",
    wordEn: "chicken",
    order: 26,
    levelId: 6,
    strokes: S.g,
    sceneHue: "#d0a070",
  }),
  L({
    id: "ng",
    grapheme: "ng",
    soundHint: "singing ng",
    ipa: "/ŋ/",
    wordVi: "ngỗng",
    wordEn: "goose",
    order: 27,
    levelId: 6,
    strokes: S.ng,
    sceneHue: "#7ab8a8",
  }),
  L({
    id: "nh",
    grapheme: "nh",
    soundHint: "soft ny",
    ipa: "/ɲ/",
    wordVi: "nhà",
    wordEn: "house",
    order: 28,
    levelId: 6,
    strokes: S.nh,
    sceneHue: "#c4a070",
  }),
  L({
    id: "h",
    grapheme: "h",
    soundHint: "soft breath h",
    ipa: "/h/",
    wordVi: "hoa",
    wordEn: "flower",
    order: 29,
    levelId: 6,
    strokes: S.h,
    sceneHue: "#e0a0b0",
  }),
  L({
    id: "l",
    grapheme: "l",
    soundHint: "light l",
    ipa: "/l/",
    wordVi: "lá",
    wordEn: "leaf",
    order: 30,
    levelId: 6,
    strokes: S.l,
    sceneHue: "#7ac48a",
  }),

  // Level 7 — Flow & hiss
  L({
    id: "r",
    grapheme: "r",
    soundHint: "Southern r (often soft)",
    ipa: "/r~ʐ/",
    wordVi: "rùa",
    wordEn: "turtle",
    order: 31,
    levelId: 7,
    strokes: S.r,
    sceneHue: "#8a9ec4",
  }),
  L({
    id: "s",
    grapheme: "s",
    soundHint: "sh-like in South",
    ipa: "/s~ʂ/",
    wordVi: "sách",
    wordEn: "book",
    order: 32,
    levelId: 7,
    strokes: S.s,
    sceneHue: "#c4b07a",
  }),
  L({
    id: "x",
    grapheme: "x",
    soundHint: "sharp s",
    ipa: "/s/",
    wordVi: "xe",
    wordEn: "vehicle",
    order: 33,
    levelId: 7,
    strokes: S.x,
    sceneHue: "#a07ac4",
  }),
  L({
    id: "tr",
    grapheme: "tr",
    soundHint: "ch-like blend in South",
    ipa: "/ʈ~tɕ/",
    wordVi: "trai",
    wordEn: "boy",
    order: 34,
    levelId: 7,
    strokes: S.tr,
    sceneHue: "#7aa0c4",
  }),
  L({
    id: "ch",
    grapheme: "ch",
    soundHint: "soft ch",
    ipa: "/c~tɕ/",
    wordVi: "chó",
    wordEn: "dog",
    order: 35,
    levelId: 7,
    strokes: S.ch,
    sceneHue: "#c48a6a",
  }),

  // Level 8 — Blends
  L({
    id: "qu",
    grapheme: "qu",
    soundHint: "kw / w before vowels",
    ipa: "/kw~w/",
    wordVi: "quả",
    wordEn: "fruit",
    order: 36,
    levelId: 8,
    strokes: S.qu,
    sceneHue: "#c47a8a",
  }),
  L({
    id: "gi",
    grapheme: "gi",
    soundHint: "like z / y in South",
    ipa: "/z~j/",
    wordVi: "gì",
    wordEn: "what",
    order: 37,
    levelId: 8,
    strokes: S.gi,
    sceneHue: "#8ab89a",
  }),
  L({
    id: "gh",
    grapheme: "gh",
    soundHint: "hard g before e, ê, i",
    ipa: "/ɣ/",
    wordVi: "ghế",
    wordEn: "chair",
    order: 38,
    levelId: 8,
    strokes: S.gh,
    sceneHue: "#b89a70",
  }),
];

/** @deprecated use ALL_LETTERS — kept for older imports */
export const LEVEL1_LETTERS = ALL_LETTERS;

export function getLetter(id: string): LetterLesson | undefined {
  return ALL_LETTERS.find((l) => l.id === id);
}

export function getLettersForLevel(levelId: number): LetterLesson[] {
  return ALL_LETTERS.filter((l) => l.levelId === levelId);
}

export function getLevel(levelId: number): LevelDef | undefined {
  return LEVELS.find((l) => l.id === levelId);
}

export function getNextLetter(id: string): LetterLesson | undefined {
  const current = getLetter(id);
  if (!current) return undefined;
  return ALL_LETTERS.find((l) => l.order === current.order + 1);
}

export const SAY_TARGET_REPS = 10;
export const MASTERY_SAY_STREAK = SAY_TARGET_REPS;
