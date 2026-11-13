"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraphemeHero } from "@/components/GraphemeHero";
import { ListenControls } from "@/components/ListenControls";
import { StudioChrome } from "@/components/StudioChrome";
import type { LetterLesson } from "@/lib/letters";
import { loadProgress, markHeard } from "@/lib/progress";

export function HearClient({ letter }: { letter: LetterLesson }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    if (p.letters[letter.id]?.heard) setReady(true);
  }, [letter.id]);

  function onListened() {
    markHeard(loadProgress(), letter.id);
    setReady(true);
  }

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="hear"
      caption="Listen first. No mic yet — just the teacher’s model."
    >
      <GraphemeHero grapheme={letter.grapheme} hint={`${letter.soundHint} · ${letter.ipa}`} />
      <ListenControls text={letter.listenText} onListened={onListened} />
      <div className="mt-auto pt-10">
        <Link
          href={`/studio/${letter.id}/say`}
          className={`teacher-btn-primary w-full ${ready ? "" : "pointer-events-none opacity-40"}`}
          aria-disabled={!ready}
        >
          Next: Say it
        </Link>
        {!ready ? (
          <p className="mt-3 text-center text-sm text-ink/45">
            Press Listen at least once to continue (works even if speech audio fails).
          </p>
        ) : null}
      </div>
    </StudioChrome>
  );
}
