"use client";

import { HearWriteClient } from "@/app/hear-write/HearWriteClient";
import type { LetterLesson } from "@/lib/letters";
import { graphemeLength } from "@/lib/hearWrite";

/**
 * Alphabet Write step is now Hear & Write dictation for this letter
 * (listen → type), with access to the full leveled combo curriculum.
 */
export function WriteClient({ letter }: { letter: LetterLesson }) {
  const len = graphemeLength(letter.grapheme);
  const level = (len <= 1 ? 1 : len === 2 ? 2 : len === 3 ? 3 : 4) as 1 | 2 | 3 | 4;
  return <HearWriteClient initialLevel={level} initialWritten={letter.grapheme} />;
}
