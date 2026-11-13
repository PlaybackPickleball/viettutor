"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { StepStars } from "./StepStars";
import { getLetter } from "@/lib/letters";
import { loadProgress, type LetterProgress } from "@/lib/progress";

type Step = "hear" | "say" | "write" | "object";

const STEPS: { id: Step; label: string }[] = [
  { id: "hear", label: "Hear" },
  { id: "say", label: "Say" },
  { id: "write", label: "Write" },
  { id: "object", label: "Link" },
];

type Props = {
  letterId: string;
  grapheme: string;
  step: Step;
  children: ReactNode;
  caption?: string;
  progressTick?: number;
};

export function StudioChrome({
  letterId,
  grapheme,
  step,
  children,
  caption,
  progressTick = 0,
}: Props) {
  const [letterProgress, setLetterProgress] = useState<LetterProgress | undefined>();

  useEffect(() => {
    const p = loadProgress();
    setLetterProgress(p.letters[letterId]);
  }, [letterId, progressTick, step]);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">
            Level {getLetter(letterId)?.levelId ?? "—"} · {grapheme}
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[#e0d0bc] bg-paper/80 px-3 py-1.5 text-sm text-ink/70 hover:bg-soft"
        >
          Home
        </Link>
      </header>

      <StepStars progress={letterProgress} current={step} />

      <nav aria-label="Lesson steps" className="mb-6 flex gap-1">
        {STEPS.map((s) => {
          const active = s.id === step;
          return (
            <Link
              key={s.id}
              href={`/studio/${letterId}/${s.id}`}
              className={`flex-1 rounded-xl py-2 text-center text-sm transition ${
                active
                  ? "bg-ink text-paper"
                  : "bg-paper/70 text-ink/45 hover:bg-soft hover:text-ink/70"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {caption ? <p className="mb-5 text-base text-ink/70">{caption}</p> : null}

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
