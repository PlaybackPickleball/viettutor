/**
 * Six Southern-first open syllables for tone discrimination checks.
 * Used in unit tests and optional live Deepgram probes — not lesson content.
 */
export const BA_TONE_SET = [
  { written: "ba", tone: "ngang", glossEn: "three / dad (context)" },
  { written: "bà", tone: "huyền", glossEn: "grandmother" },
  { written: "bá", tone: "sắc", glossEn: "paternal aunt / count" },
  { written: "bả", tone: "hỏi", glossEn: "poison / bait (context)" },
  { written: "bã", tone: "ngã", glossEn: "residue / pulp" },
  { written: "bạ", tone: "nặng", glossEn: "any / careless (context)" },
] as const;

export type BaToneItem = (typeof BA_TONE_SET)[number];
