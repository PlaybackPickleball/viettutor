import { normalizeViWord } from "@/lib/vi/feedback";
import type { TypingGrade } from "./types";

/** Strip combining marks after NFC for base-letter comparison. */
export function stripDiacritics(s: string): string {
  return s.normalize("NFC").normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Grade a typed Vietnamese answer against the expected word.
 * NFC-normalized; wrong diacritics get a soft hint (plan § typing).
 */
export function gradeTypedVi(input: string, expected: string): TypingGrade {
  const got = normalizeViWord(input);
  const want = normalizeViWord(expected);
  if (!got) return { ok: false, reason: "empty", hint: "Type the Vietnamese word." };
  if (got === want) return { ok: true, exact: true };

  const gotBase = stripDiacritics(got).toLowerCase();
  const wantBase = stripDiacritics(want).toLowerCase();
  if (gotBase === wantBase) {
    return {
      ok: false,
      reason: "wrong_diacritics",
      hint: "Almost — check the tone marks and vowel marks.",
    };
  }
  return {
    ok: false,
    reason: "wrong_base",
    hint: "Not quite — listen again and try the Vietnamese spelling.",
  };
}

/** Accept common Telex-style unfinished input only after Enter; we grade NFC forms only. */
export function nfcFold(s: string): string {
  return s.normalize("NFC").trim();
}
