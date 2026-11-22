"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { LetterTraceCanvas } from "@/components/LetterTraceCanvas";
import { StrokeDemo } from "@/components/StrokeDemo";
import { ALL_LETTERS } from "@/lib/letters";

/** Optional handwriting — kept out of mandatory Hear → Recognize → Say → Recall lessons. */
export function HandwritingPracticeClient() {
  const letters = useMemo(
    () => ALL_LETTERS.filter((l) => l.grapheme.length === 1 || l.id.includes("-")),
    [],
  );
  const [letterId, setLetterId] = useState(letters[0]?.id ?? "a");
  const letter = letters.find((l) => l.id === letterId) ?? letters[0];

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Practice · optional</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Handwriting</h1>
          <p className="mt-1 text-ink/60">
            Mali tracing for shape practice — not part of core lessons, never scored.
          </p>
        </div>
        <Link href="/practice" className="teacher-btn-secondary px-3 py-2 text-sm">
          Practice
        </Link>
      </header>

      <label className="block">
        <span className="quiet-label">Letter</span>
        <select
          className="mt-2 w-full rounded-2xl border border-[#e8d9c8] bg-paper px-4 py-3 text-ink"
          value={letter?.id}
          onChange={(e) => setLetterId(e.target.value)}
        >
          {letters.map((l) => (
            <option key={l.id} value={l.id}>
              {l.grapheme} · {l.soundHint}
            </option>
          ))}
        </select>
      </label>

      {letter ? (
        <section className="ami-card mt-4 space-y-4 px-4 py-5">
          <p className="text-center font-hand text-6xl text-ink" lang="vi">
            {letter.grapheme}
          </p>
          {(letter.strokes?.length ?? 0) > 0 ? (
            <StrokeDemo strokes={letter.strokes} grapheme={letter.grapheme} autoPlay />
          ) : null}
          <LetterTraceCanvas
            strokes={letter.strokes ?? []}
            grapheme={letter.grapheme}
            praiseMode="unrecognized"
            idleHint="Trace the Mali model — practice only."
          />
          <Link
            href={`/studio/${letter.id}/write`}
            className="teacher-btn-secondary inline-flex w-full justify-center text-sm"
          >
            Open studio Write for {letter.grapheme}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
