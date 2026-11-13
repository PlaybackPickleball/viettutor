"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CelebrateBanner } from "@/components/CelebrateBanner";
import { SoundObjectScene } from "@/components/SoundObjectScene";
import { StudioChrome } from "@/components/StudioChrome";
import { getNextLetter, type LetterLesson } from "@/lib/letters";
import { praiseForLetterDone, praiseForStep } from "@/lib/motivation";
import { isLetterComplete, loadProgress, markObjectSeen } from "@/lib/progress";

export function ObjectClient({ letter }: { letter: LetterLesson }) {
  const next = getNextLetter(letter.id);
  const [justLinked, setJustLinked] = useState(false);
  const [letterDone, setLetterDone] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const before = loadProgress().letters[letter.id]?.objectSeen;
    const nextState = markObjectSeen(loadProgress(), letter.id);
    setTick((t) => t + 1);
    if (!before) setJustLinked(true);
    if (isLetterComplete(nextState.letters[letter.id])) setLetterDone(true);
  }, [letter.id]);

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="object"
      caption="Link the sound to one picture — meaning after sound, not instead of it."
      progressTick={tick}
    >
      {letterDone ? (
        <CelebrateBanner
          variant="letter"
          message={praiseForLetterDone(letter.order)}
        />
      ) : justLinked ? (
        <CelebrateBanner message={praiseForStep("object", letter.order)} />
      ) : null}

      <SoundObjectScene letter={letter} />

      <div className="mt-auto flex flex-col gap-3 pt-10">
        {next ? (
          <Link href={`/studio/${next.id}/hear`} className="teacher-btn-primary w-full text-center">
            Next sound · <span lang="vi">{next.grapheme}</span>
          </Link>
        ) : (
          <Link href="/" className="teacher-btn-primary w-full text-center">
            Level 1 subset complete — Dashboard
          </Link>
        )}
        <Link href="/" className="teacher-btn-secondary w-full text-center">
          Back to dashboard
        </Link>
      </div>
    </StudioChrome>
  );
}
