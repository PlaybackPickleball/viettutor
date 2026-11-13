/** Beginner Vietnamese lexicon for Scan & Read meanings (Southern-friendly). */

export type LexEntry = {
  vi: string;
  en: string;
  note?: string;
  toneHint?: string;
};

/** Longer compounds first — used by segmentation longest-match. */
export const COMPOUND_LEXICON: LexEntry[] = [
  { vi: "nước dừa", en: "coconut water", note: "Compound of two syllables." },
  { vi: "cà phê", en: "coffee", note: "Common drink loanword." },
  { vi: "phở bò", en: "beef pho", note: "Classic noodle soup." },
  { vi: "bánh mì", en: "Vietnamese sandwich / bread" },
  { vi: "xin chào", en: "hello" },
  { vi: "cảm ơn", en: "thank you" },
  { vi: "tạm biệt", en: "goodbye" },
  { vi: "bao nhiêu", en: "how much / how many" },
  { vi: "làm ơn", en: "please" },
  { vi: "không sao", en: "it's okay / no problem" },
  { vi: "tôm rim", en: "caramelized prawns" },
  { vi: "ba rọi", en: "pork belly" },
  { vi: "bò xào", en: "stir-fried beef" },
  { vi: "nước mắm", en: "fish sauce" },
  { vi: "trà đá", en: "iced tea" },
  { vi: "sinh tố", en: "smoothie" },
];

export const SYLLABLE_LEXICON: LexEntry[] = [
  { vi: "tôi", en: "I / me" },
  { vi: "bạn", en: "you / friend" },
  { vi: "muốn", en: "want", toneHint: "sắc (rising) in Northern; Southern often similar rise." },
  { vi: "uống", en: "to drink" },
  { vi: "ăn", en: "to eat" },
  { vi: "nước", en: "water / liquid", toneHint: "sắc tone — rising." },
  { vi: "dừa", en: "coconut" },
  { vi: "cơm", en: "cooked rice / meal" },
  { vi: "phở", en: "pho (noodle soup)" },
  { vi: "cà", en: "coffee (first syllable) / eggplant" },
  { vi: "phê", en: "second syllable of cà phê" },
  { vi: "xin", en: "please / beg" },
  { vi: "chào", en: "greet" },
  { vi: "cảm", en: "feel (in cảm ơn)" },
  { vi: "ơn", en: "favor / grace (in cảm ơn)" },
  { vi: "là", en: "to be / is" },
  { vi: "có", en: "to have / yes" },
  { vi: "không", en: "no / not" },
  { vi: "và", en: "and" },
  { vi: "với", en: "with" },
  { vi: "một", en: "one / a" },
  { vi: "hai", en: "two" },
  { vi: "ba", en: "three" },
  { vi: "đi", en: "to go" },
  { vi: "đến", en: "to arrive / to" },
  { vi: "nhà", en: "house / home" },
  { vi: "trường", en: "school" },
  { vi: "học", en: "to study" },
  { vi: "đọc", en: "to read" },
  { vi: "nói", en: "to speak" },
  { vi: "nghe", en: "to listen / hear" },
  { vi: "viết", en: "to write" },
  { vi: "thích", en: "to like" },
  { vi: "đẹp", en: "beautiful" },
  { vi: "ngon", en: "delicious" },
  { vi: "nóng", en: "hot" },
  { vi: "lạnh", en: "cold" },
  { vi: "xin", en: "please" },
  { vi: "tôm", en: "prawn / shrimp" },
  { vi: "bò", en: "beef / cow" },
  { vi: "gà", en: "chicken" },
  { vi: "cá", en: "fish" },
  { vi: "ốc", en: "snail" },
  { vi: "mực", en: "squid" },
  { vi: "giá", en: "price" },
  { vi: "món", en: "dish" },
  { vi: "menu", en: "menu" },
];

const byLower = new Map<string, LexEntry>();
for (const e of [...COMPOUND_LEXICON, ...SYLLABLE_LEXICON]) {
  byLower.set(e.vi.toLowerCase(), e);
}

export function lookupLexicon(text: string): LexEntry | undefined {
  const key = text
    .trim()
    .replace(/[.,!?;:…""''()]/g, "")
    .toLowerCase();
  return byLower.get(key);
}

export function compoundKeysLongestFirst(): string[] {
  return COMPOUND_LEXICON.map((e) => e.vi.toLowerCase()).sort((a, b) => b.length - a.length);
}
