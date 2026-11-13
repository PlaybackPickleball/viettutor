import { lookupLexicon } from "./lexicon";
import type { TutorExplanation } from "./types";

export function explainExpression(
  expression: string,
  sentence?: string,
): TutorExplanation {
  const entry = lookupLexicon(expression);
  if (entry) {
    return {
      expression: entry.vi,
      meaningEn: entry.en,
      inContext: sentence
        ? `In this text, “${entry.vi}” contributes the idea of “${entry.en}”.`
        : undefined,
      note: entry.note,
      toneHint: entry.toneHint,
      source: "lexicon",
    };
  }

  const cleaned = expression.trim();
  return {
    expression: cleaned,
    meaningEn: "Meaning not in the beginner lexicon yet",
    note: "You can still listen and practice. Add a correction or wait for richer tutor support.",
    inContext: sentence
      ? "Keep this expression linked to the corrected OCR sentence — do not invent unrelated context."
      : undefined,
    source: "fallback",
  };
}
