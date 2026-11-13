"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CelebrateBanner } from "@/components/CelebrateBanner";
import { LetterTraceCanvas } from "@/components/LetterTraceCanvas";
import { StrokeDemo } from "@/components/StrokeDemo";
import { StudioChrome } from "@/components/StudioChrome";
import type { LetterLesson } from "@/lib/letters";
import { praiseForStep } from "@/lib/motivation";
import { loadProgress, markWritten } from "@/lib/progress";

export function WriteClient({ letter }: { letter: LetterLesson }) {
  const [done, setDone] = useState(false);
  const [justEarned, setJustEarned] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const p = loadProgress();
    if (p.letters[letter.id]?.written) setDone(true);
  }, [letter.id]);

  function completeWrite() {
    const before = loadProgress().letters[letter.id]?.written;
    markWritten(loadProgress(), letter.id);
    setDone(true);
    setTick((t) => t + 1);
    if (!before) setJustEarned(true);
  }

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="write"
      caption="Trace in notebook handwriting. Watch the stroke demo, then write on the lines."
      progressTick={tick}
    >
      {justEarned ? <CelebrateBanner message={praiseForStep("write", letter.order)} /> : null}

      <p
        className="mb-2 text-center font-hand text-6xl font-medium tracking-wide text-ink/85"
        lang="vi"
      >
        {letter.grapheme}
      </p>
      <p className="mb-4 text-center text-xs text-ink/40">
        Cursive handwriting model · Dancing Script (Vietnamese)
      </p>
      <StrokeDemo strokes={letter.strokes} grapheme={letter.grapheme} />
      <LetterTraceCanvas
        strokes={letter.strokes}
        grapheme={letter.grapheme}
        onTraceComplete={completeWrite}
      />

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
        <button type="button" className="teacher-btn-secondary w-full" onClick={completeWrite}>
          Mark written & continue
        </button>
      </div>
    </StudioChrome>
  );
}
