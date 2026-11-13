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
      caption="Practice the letter shape — notebook cursive with stroke guidance."
      progressTick={tick}
    >
      {justEarned ? <CelebrateBanner message={praiseForStep("write", letter.order)} /> : null}

      <div className="ami-card mb-5 px-4 py-6 text-center">
        <p className="font-hand text-6xl font-medium text-ink" lang="vi">
          {letter.grapheme}
        </p>
        <p className="mt-2 text-xs text-ink/40">Cursive model · Dancing Script (Vietnamese)</p>
      </div>

      <StrokeDemo strokes={letter.strokes} grapheme={letter.grapheme} />
      <LetterTraceCanvas
        strokes={letter.strokes}
        grapheme={letter.grapheme}
        onTraceComplete={completeWrite}
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" className="teacher-btn-secondary py-3 text-sm" onClick={completeWrite}>
          Trace ✓
        </button>
        <Link href={`/studio/${letter.id}/write`} className="teacher-btn-secondary py-3 text-center text-sm">
          Clear
        </Link>
        <button type="button" className="teacher-btn-primary py-3 text-sm" onClick={completeWrite}>
          Check
        </button>
      </div>

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
      </div>
    </StudioChrome>
  );
}
