"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraphemeHero } from "@/components/GraphemeHero";
import { ListenControls } from "@/components/ListenControls";
import { MicRecorder } from "@/components/MicRecorder";
import { StudioChrome } from "@/components/StudioChrome";
import { MASTERY_SAY_STREAK, type LetterLesson } from "@/lib/letters";
import type { ScoreResult } from "@/lib/pronunciation";
import { loadProgress, recordSayAttempt, type ProgressState } from "@/lib/progress";

export function SayClient({ letter }: { letter: LetterLesson }) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [listened, setListened] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    setListened(Boolean(p.letters[letter.id]?.heard));
  }, [letter.id]);

  const letterProg = progress?.letters[letter.id];
  const mastered = Boolean(letterProg?.sayMastered);
  const streak = letterProg?.sayStreak ?? 0;
  const attempts = letterProg?.attempts ?? 0;

  function onScored(result: ScoreResult) {
    const next = recordSayAttempt(loadProgress(), letter.id, result.passed && result.dimension === "ok");
    setProgress(next);
  }

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="say"
      caption="Match the teacher. One tip per try — then try again."
    >
      <GraphemeHero grapheme={letter.grapheme} hint={letter.soundHint} />

      <div className="mb-6">
        <ListenControls text={letter.listenText} onListened={() => setListened(true)} />
      </div>

      <MicRecorder
        letterId={letter.id}
        grapheme={letter.grapheme}
        listened={listened}
        attemptIndex={attempts}
        onScored={onScored}
      />

      <p className="mt-6 text-center text-sm text-ink/50">
        {mastered
          ? "Sound steadied — you can move to writing."
          : `One solid take unlocks Write (${streak}/${MASTERY_SAY_STREAK}). First miss shows a why-wrong tip.`}
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href={`/studio/${letter.id}/write`}
          className={`teacher-btn-primary w-full text-center ${
            mastered ? "" : "pointer-events-none opacity-40"
          }`}
          aria-disabled={!mastered}
        >
          Next: Write it
        </Link>
        <Link href={`/studio/${letter.id}/hear`} className="teacher-btn-secondary w-full text-center">
          Back to Hear
        </Link>
      </div>
    </StudioChrome>
  );
}
