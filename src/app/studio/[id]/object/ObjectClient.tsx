"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SoundObjectScene } from "@/components/SoundObjectScene";
import { StudioChrome } from "@/components/StudioChrome";
import { getNextLetter, type LetterLesson } from "@/lib/letters";
import { loadProgress, markObjectSeen } from "@/lib/progress";

export function ObjectClient({ letter }: { letter: LetterLesson }) {
  const next = getNextLetter(letter.id);

  useEffect(() => {
    markObjectSeen(loadProgress(), letter.id);
  }, [letter.id]);

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="object"
      caption="Link the sound to one picture — meaning after sound, not instead of it."
    >
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
