"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LetterTraceCanvas } from "@/components/LetterTraceCanvas";
import { StrokeDemo } from "@/components/StrokeDemo";
import { StudioChrome } from "@/components/StudioChrome";
import type { LetterLesson } from "@/lib/letters";
import { loadProgress, markWritten } from "@/lib/progress";

export function WriteClient({ letter }: { letter: LetterLesson }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    if (p.letters[letter.id]?.written) setDone(true);
  }, [letter.id]);

  function onTraceComplete() {
    markWritten(loadProgress(), letter.id);
    setDone(true);
  }

  function markAndContinue() {
    markWritten(loadProgress(), letter.id);
    setDone(true);
  }

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="write"
      caption="Trace the letter. Watch the stroke demo, then write on the lines."
    >
      <p className="mb-2 text-center font-display text-5xl text-ink/80" lang="vi">
        {letter.grapheme}
      </p>
      <StrokeDemo strokes={letter.strokes} grapheme={letter.grapheme} />
      <LetterTraceCanvas strokes={letter.strokes} onTraceComplete={onTraceComplete} />

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href={`/studio/${letter.id}/object`}
          className={`teacher-btn-primary w-full text-center ${
            done ? "" : "pointer-events-none opacity-40"
          }`}
          aria-disabled={!done}
        >
          Next: Sound & picture
        </Link>
        <button type="button" className="teacher-btn-secondary w-full" onClick={markAndContinue}>
          Mark written & continue
        </button>
      </div>
    </StudioChrome>
  );
}
