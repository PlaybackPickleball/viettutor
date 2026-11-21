"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { continueHref, loadProgress } from "@/lib/progress";
import { continuePathHref, loadPathProgress, skillsDueForReview } from "@/lib/phonics/learningPath";
import { markJourneyLessonComplete } from "@/lib/journey";

export function PracticeHubClient() {
  const [speakHref, setSpeakHref] = useState("/studio/a/say");
  const [writeHref, setWriteHref] = useState("/hear-write");
  const [pathHref, setPathHref] = useState("/danh-van");
  const [due, setDue] = useState(0);

  useEffect(() => {
    const alphabet = loadProgress();
    const path = loadPathProgress();
    const letter = alphabet.currentLetterId || "a";
    setSpeakHref(`/studio/${letter}/say`);
    setWriteHref("/hear-write");
    setPathHref(continuePathHref(path));
    setDue(skillsDueForReview(path, 8).length);
  }, []);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-6">
        <BrandMark />
        <p className="quiet-label mt-3">Drills</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Practice</h1>
        <p className="mt-1 text-ink/60">
          Reuse Hear · Write · Say · Review — Deepgram match only, no invented scores.
        </p>
      </header>

      <ul className="space-y-3">
        <PracticeLink
          href={writeHref}
          title="Hear & Write"
          blurb="Dictation combos — Mali handwriting ready."
          onOpen={() => markJourneyLessonComplete("u1-l06")}
        />
        <PracticeLink
          href={speakHref}
          title="Speak"
          blurb="Studio Say with Deepgram Vietnamese match."
        />
        <PracticeLink
          href="/danh-van/review"
          title="Daily Review"
          blurb={due ? `${due} skills due for spaced revisit.` : "Spaced skills when due."}
        />
        <PracticeLink
          href={pathHref}
          title="Đánh Vần lesson"
          blurb="Continue Hear → Write → Say → Review on the path."
        />
        <PracticeLink href="/scan" title="Photograph Vietnamese" blurb="Scan and read in context." />
        <PracticeLink
          href={continueHref(loadProgress())}
          title="Alphabet studio"
          blurb="Classic Hear · Say · Write · Link for letters."
        />
      </ul>
    </div>
  );
}

function PracticeLink({
  href,
  title,
  blurb,
  onOpen,
}: {
  href: string;
  title: string;
  blurb: string;
  onOpen?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onOpen}
        className="ami-card flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-paper"
      >
        <div>
          <p className="font-display text-lg text-ink">{title}</p>
          <p className="mt-0.5 text-sm text-ink/55">{blurb}</p>
        </div>
        <span className="text-coral" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}
