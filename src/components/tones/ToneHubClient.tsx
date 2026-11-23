"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { markJourneyLessonComplete } from "@/lib/journey";
import {
  allTonesMastered,
  continueToneHref,
  loadToneProgress,
  setToneDialect,
  TONE_CARDS,
  TONE_MASTERY_THRESHOLD,
  TONE_PLACEMENT_NOTES,
  tonesMasteredCount,
  type ToneDialect,
  type ToneProgressState,
} from "@/lib/tones";

export function ToneHubClient() {
  const [state, setState] = useState<ToneProgressState | null>(null);

  useEffect(() => {
    setState(loadToneProgress());
    markJourneyLessonComplete("u2-l04");
  }, []);

  if (!state) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading tones…</p>
      </div>
    );
  }

  const mastered = tonesMasteredCount(state);
  const continueHref = continueToneHref(state);

  function setDialect(d: ToneDialect) {
    setState(setToneDialect(d));
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5">
        <BrandMark />
        <p className="quiet-label mt-3">Before Đánh Vần</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Dấu Thanh</h1>
        <p className="mt-1 text-ink/60">
          Vietnamese tones — six categories on ma / má / mà / mả / mã / mạ. Marks ≠ pitch graphs.
        </p>
      </header>

      <section className="ami-card mb-4 px-4 py-4">
        <p className="quiet-label">Dialect</p>
        <div className="mt-2 flex gap-2">
          {(
            [
              ["southern", "Southern"],
              ["northern", "Northern"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold ${
                state.dialect === id ? "bg-coral text-white" : "bg-soft text-ink/60"
              }`}
              onClick={() => setDialect(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Southern hỏi/ngã often merge — listening quizzes never mark a legitimate merge as wrong.
          Writing still uses both marks.
        </p>
      </section>

      <section className="ami-card mb-4 px-4 py-4">
        <p className="quiet-label">Progress</p>
        <p className="mt-1 font-display text-2xl text-ink">
          {mastered} / 6 mastered
          <span className="text-base font-sans text-ink/45">
            {" "}
            · ≥{Math.round(TONE_MASTERY_THRESHOLD * 100)}% quiz
          </span>
        </p>
        <Link href={continueHref} className="teacher-btn-primary mt-3 inline-flex w-full justify-center">
          Continue
        </Link>
      </section>

      <ul className="space-y-2">
        {TONE_CARDS.map((card) => {
          const rec = state.lessons[card.id];
          const done = Boolean(rec?.mastered);
          const started = Boolean(rec?.completed);
          return (
            <li key={card.id}>
              <Link
                href={`/dau-thanh/${card.id}`}
                className="ami-card flex items-center gap-3 px-4 py-3 transition hover:ring-1 hover:ring-coral/30"
              >
                <span className="font-hand text-3xl text-ink" lang="vi">
                  {card.written}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg text-ink">
                    {card.nameVi}
                    <span className="ml-1 text-sm font-sans font-normal text-ink/45">
                      {card.nameEn}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-ink/45">{card.meaningEn}</span>
                </span>
                <span className="text-xs font-semibold text-coral">
                  {done ? "Mastered" : started ? "Retry" : "Open"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mt-4 space-y-3">
        <Link
          href="/dau-thanh/mastery"
          className={`teacher-btn-primary flex w-full justify-center ${
            allTonesMastered(state) ? "" : "opacity-80"
          }`}
        >
          Final mastery test
          {state.masteryTest.passed ? " · Passed" : ""}
        </Link>
        <Link href="/danh-van" className="teacher-btn-secondary flex w-full justify-center text-sm">
          Next unit · Đánh Vần
        </Link>
        <Link href="/learn" className="block text-center text-sm text-ink/45 underline-offset-2 hover:underline">
          Full learn path
        </Link>
      </section>

      <section className="mt-6 text-xs text-ink/45">
        <p className="quiet-label">Placement</p>
        <ul className="mt-2 space-y-1">
          {TONE_PLACEMENT_NOTES.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
