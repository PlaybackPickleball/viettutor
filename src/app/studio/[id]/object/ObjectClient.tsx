"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CelebrateBanner } from "@/components/CelebrateBanner";
import { SoundObjectScene } from "@/components/SoundObjectScene";
import { StudioChrome } from "@/components/StudioChrome";
import { getLevel, getNextLetter, type LetterLesson } from "@/lib/letters";
import { praiseForLetterDone, praiseForStep } from "@/lib/motivation";
import {
  isLetterComplete,
  isLevelComplete,
  isLevelUnlocked,
  loadProgress,
  markObjectSeen,
} from "@/lib/progress";

export function ObjectClient({ letter }: { letter: LetterLesson }) {
  const next = getNextLetter(letter.id);
  const [justLinked, setJustLinked] = useState(false);
  const [letterDone, setLetterDone] = useState(false);
  const [levelJustDone, setLevelJustDone] = useState(false);
  const [tick, setTick] = useState(0);
  const [nextUnlocked, setNextUnlocked] = useState(true);

  useEffect(() => {
    const before = loadProgress().letters[letter.id]?.objectSeen;
    const nextState = markObjectSeen(loadProgress(), letter.id);
    setTick((t) => t + 1);
    if (!before) setJustLinked(true);
    if (isLetterComplete(nextState.letters[letter.id])) setLetterDone(true);
    setLevelJustDone(isLevelComplete(nextState, letter.levelId));
    if (next) setNextUnlocked(isLevelUnlocked(nextState, next.levelId));
  }, [letter.id, letter.levelId, next]);

  const nextLevel = next ? getLevel(next.levelId) : undefined;
  const thisLevel = getLevel(letter.levelId);

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="object"
      caption="Link the sound to one picture — meaning after sound, not instead of it."
      progressTick={tick}
    >
      {levelJustDone && letterDone ? (
        <CelebrateBanner
          variant="letter"
          message={`Level ${letter.levelId} complete${thisLevel ? ` · ${thisLevel.title}` : ""} — next set unlocked.`}
        />
      ) : letterDone ? (
        <CelebrateBanner variant="letter" message={praiseForLetterDone(letter.order)} />
      ) : justLinked ? (
        <CelebrateBanner message={praiseForStep("object", letter.order)} />
      ) : null}

      <SoundObjectScene letter={letter} />

      <div className="mt-auto flex flex-col gap-3 pt-10">
        {next && nextUnlocked ? (
          <Link href={`/studio/${next.id}/hear`} className="teacher-btn-primary w-full text-center">
            Next sound · <span lang="vi">{next.grapheme}</span>
          </Link>
        ) : next && !nextUnlocked ? (
          <Link href="/" className="teacher-btn-primary w-full text-center">
            Unlock Level {next.levelId}
            {nextLevel ? ` · ${nextLevel.title}` : ""} on Home
          </Link>
        ) : (
          <Link href="/" className="teacher-btn-primary w-full text-center">
            Alphabet path complete — Home
          </Link>
        )}
        <Link href="/" className="teacher-btn-secondary w-full text-center">
          Back to dashboard
        </Link>
      </div>
    </StudioChrome>
  );
}
