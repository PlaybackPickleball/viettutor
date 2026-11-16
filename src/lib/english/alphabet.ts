import { ALL_LETTERS } from "@/lib/letters";

export type LatinLetter = {
  grapheme: string;
  nameEn: string;
  nameVi: string;
  exampleEn: string;
  exampleVi: string;
  strokes: string[];
  /** Recognition of handwriting is not validated. */
  recognition: "unavailable";
};

const DETAILS: Record<string, Omit<LatinLetter, "grapheme" | "strokes" | "recognition">> = {
  a: { nameEn: "ay", nameVi: "Tên chữ là ay", exampleEn: "cat", exampleVi: "âm ngắn trong cat khác tên chữ" },
  b: { nameEn: "bee", nameVi: "Tên chữ là bee", exampleEn: "bus", exampleVi: "âm đầu trong bus" },
  c: { nameEn: "see", nameVi: "Tên chữ là see", exampleEn: "coffee", exampleVi: "âm đầu trong coffee" },
  d: { nameEn: "dee", nameVi: "Tên chữ là dee", exampleEn: "day", exampleVi: "âm đầu trong day" },
  e: { nameEn: "ee", nameVi: "Tên chữ là ee", exampleEn: "ten", exampleVi: "âm trong ten khác tên chữ" },
  f: { nameEn: "ef", nameVi: "Tên chữ là ef", exampleEn: "fine", exampleVi: "âm đầu trong fine" },
  g: { nameEn: "jee", nameVi: "Tên chữ là jee", exampleEn: "go", exampleVi: "âm đầu trong go" },
  h: { nameEn: "aitch", nameVi: "Tên chữ là aitch", exampleEn: "hello", exampleVi: "âm đầu trong hello" },
  i: { nameEn: "eye", nameVi: "Tên chữ là eye", exampleEn: "it", exampleVi: "âm trong it khác tên chữ" },
  j: { nameEn: "jay", nameVi: "Tên chữ là jay", exampleEn: "job", exampleVi: "âm đầu trong job" },
  k: { nameEn: "kay", nameVi: "Tên chữ là kay", exampleEn: "kilo", exampleVi: "âm đầu trong kilo" },
  l: { nameEn: "el", nameVi: "Tên chữ là el", exampleEn: "left", exampleVi: "âm đầu trong left" },
  m: { nameEn: "em", nameVi: "Tên chữ là em", exampleEn: "mother", exampleVi: "âm đầu trong mother" },
  n: { nameEn: "en", nameVi: "Tên chữ là en", exampleEn: "name", exampleVi: "âm đầu trong name" },
  o: { nameEn: "oh", nameVi: "Tên chữ là oh", exampleEn: "not", exampleVi: "âm trong not khác tên chữ" },
  p: { nameEn: "pee", nameVi: "Tên chữ là pee", exampleEn: "please", exampleVi: "âm đầu trong please" },
  q: { nameEn: "cue", nameVi: "Tên chữ là cue", exampleEn: "question", exampleVi: "thường đi với u" },
  r: { nameEn: "ar", nameVi: "Tên chữ là ar", exampleEn: "rice", exampleVi: "âm đầu trong rice" },
  s: { nameEn: "ess", nameVi: "Tên chữ là ess", exampleEn: "six", exampleVi: "âm đầu trong six" },
  t: { nameEn: "tee", nameVi: "Tên chữ là tee", exampleEn: "tea", exampleVi: "âm đầu trong tea" },
  u: { nameEn: "you", nameVi: "Tên chữ là you", exampleEn: "cup", exampleVi: "âm trong cup khác tên chữ" },
  v: { nameEn: "vee", nameVi: "Tên chữ là vee", exampleEn: "five", exampleVi: "âm trong five" },
  w: { nameEn: "double you", nameVi: "Tên chữ là double you", exampleEn: "water", exampleVi: "âm đầu trong water" },
  x: { nameEn: "ex", nameVi: "Tên chữ là ex", exampleEn: "six", exampleVi: "âm cuối trong six" },
  y: { nameEn: "why", nameVi: "Tên chữ là why", exampleEn: "yes", exampleVi: "âm đầu trong yes" },
  z: { nameEn: "zee", nameVi: "Tên chữ là zee, giọng Mỹ", exampleEn: "zero", exampleVi: "âm đầu trong zero" },
};

export const LATIN_LETTERS: LatinLetter[] = Object.keys(DETAILS).map((grapheme) => {
  const strokeSource = ALL_LETTERS.find((letter) => letter.grapheme === grapheme);
  return {
    grapheme,
    ...DETAILS[grapheme],
    strokes: strokeSource?.strokes ?? [],
    recognition: "unavailable",
  };
});

export function getLatinLetter(grapheme: string): LatinLetter | undefined {
  return LATIN_LETTERS.find((letter) => letter.grapheme === grapheme.toLowerCase());
}
