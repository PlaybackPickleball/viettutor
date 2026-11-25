/** Tone marks vs vowel diacritics — Chapter 5 curriculum data. */

export const VOWEL_DIACRITICS = [
  { letter: "ă", glossEn: "short a (ă)" },
  { letter: "â", glossEn: "â" },
  { letter: "ê", glossEn: "ê" },
  { letter: "ô", glossEn: "ô" },
  { letter: "ơ", glossEn: "ơ" },
  { letter: "ư", glossEn: "ư" },
] as const;

/**
 * Combined vowel + tone marks (recording wishlist / teaching set).
 * Each syllable still has at most one tone mark.
 */
export const COMBINED_DIACRITICS = [
  { letter: "ắ", vowel: "ă", toneEn: "sắc", glossEn: "ă + sắc" },
  { letter: "ầ", vowel: "â", toneEn: "huyền", glossEn: "â + huyền" },
  { letter: "ế", vowel: "ê", toneEn: "sắc", glossEn: "ê + sắc" },
  { letter: "ộ", vowel: "ô", toneEn: "nặng", glossEn: "ô + nặng (dot below)" },
  { letter: "ớ", vowel: "ơ", toneEn: "sắc", glossEn: "ơ + sắc" },
  { letter: "ữ", vowel: "ư", toneEn: "ngã", glossEn: "ư + ngã" },
] as const;

/** Chains showing vowel quality mark + tone mark stacking. */
export const DIACRITIC_CHAINS = [
  { steps: ["a", "ă", "ắ"], noteEn: "ă (vowel) + sắc (tone)" },
  { steps: ["a", "â", "ầ"], noteEn: "â (vowel) + huyền (tone)" },
  { steps: ["e", "ê", "ế"], noteEn: "ê (vowel) + sắc (tone)" },
  { steps: ["o", "ô", "ộ"], noteEn: "ô (vowel) + nặng (tone · mark below)" },
  { steps: ["o", "ơ", "ớ"], noteEn: "ơ (vowel) + sắc (tone)" },
  { steps: ["u", "ư", "ữ"], noteEn: "ư (vowel) + ngã (tone)" },
] as const;

export const DIACRITIC_RULES = [
  "Tone marks change the tone of a syllable; vowel diacritics change the vowel sound itself.",
  "ă â ê ô ơ ư are vowel letters — not tone marks.",
  "A syllable has at most one tone mark.",
  "Tone marks sit above the main vowel — except nặng, which sits below.",
  "In vowel clusters, place the tone on the nuclear (main) vowel.",
] as const;
