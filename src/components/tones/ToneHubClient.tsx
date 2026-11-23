"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ListenControls } from "@/components/ListenControls";
import { markJourneyLessonComplete } from "@/lib/journey";
import {
  allTonesMastered,
  continueToneHref,
  loadToneProgress,
  markToneFundamentalsDone,
  setToneDialect,
  TONE_CARDS,
  TONE_FUNDAMENTALS,
  TONE_MASTERY_THRESHOLD,
  tonesMasteredCount,
  type ToneDialect,
  type ToneProgressState,
} from "@/lib/tones";

type HubStep = "fundamentals" | "overview";

function ToneRowContour({ path, className }: { path: string; className: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-14 shrink-0" aria-hidden>
      <path
        d={path}
        fill="none"
        className={className}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export function ToneHubClient() {
  const [state, setState] = useState<ToneProgressState | null>(null);
  const [step, setStep] = useState<HubStep>("fundamentals");
  const [fundIdx, setFundIdx] = useState(0);

  useEffect(() => {
    const loaded = loadToneProgress();
    setState(loaded);
    setStep(loaded.fundamentalsDone ? "overview" : "fundamentals");
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
  const fund = TONE_FUNDAMENTALS[fundIdx]!;

  function setDialect(d: ToneDialect) {
    setState(setToneDialect(d));
  }

  function finishFundamentals() {
    setState(markToneFundamentalsDone());
    setStep("overview");
  }

  if (step === "fundamentals") {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <header className="mb-5">
          <div className="flex items-center justify-between gap-2">
            <Link href="/learn" className="text-sm text-ink/45 hover:text-ink">
              ← Back
            </Link>
            <p className="text-xs font-semibold text-ink/45">Lesson 1 of 3</p>
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            <span className="h-1.5 flex-1 rounded-full bg-coral" />
            <span className="h-1.5 flex-1 rounded-full bg-ink/10" />
            <span className="h-1.5 flex-1 rounded-full bg-ink/10" />
          </div>
          <div className="mt-4">
            <BrandMark />
          </div>
          <h1 className="mt-3 font-display text-3xl text-ink">Vietnamese Tones</h1>
          <p className="mt-0.5 font-display text-xl text-coral">Dấu Thanh</p>
          <p className="mt-2 text-sm text-ink/60">
            Learn the accent marks first — then hear how each tone changes meaning.
          </p>
        </header>

        <section className="ami-card mb-4 overflow-hidden px-0 py-0">
          <div className="border-b border-[#e8d9c8]/px-4 py-3">
            <p className="quiet-label">
              Fundamentals · {fundIdx + 1} / {TONE_FUNDAMENTALS.length}
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink">{fund.title}</h2>
          </div>
          <div className="px-4 py-5">
            <p className="text-[15px] leading-relaxed text-ink/75">{fund.body}</p>
            {fundIdx === 1 ? (
              <ul className="mt-4 space-y-2">
                {TONE_CARDS.map((c) => (
                  <li
                    key={c.id}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${c.rowClass}`}
                  >
                    <span className="font-hand text-2xl text-ink" lang="vi">
                      {c.written}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-ink capitalize">{c.nameVi}</span>
                      <span className="text-ink/45"> · {c.markNameEn}</span>
                    </span>
                    <span className="text-lg text-coral" aria-hidden>
                      {c.id === "ngang" ? "—" : c.markChar}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <div className="flex gap-2">
          {fundIdx > 0 ? (
            <button
              type="button"
              className="teacher-btn-secondary flex-1"
              onClick={() => setFundIdx((i) => i - 1)}
            >
              Back
            </button>
          ) : null}
          {fundIdx < TONE_FUNDAMENTALS.length - 1 ? (
            <button
              type="button"
              className="teacher-btn-primary flex-1"
              onClick={() => setFundIdx((i) => i + 1)}
            >
              Next
            </button>
          ) : (
            <button type="button" className="teacher-btn-primary flex-1" onClick={finishFundamentals}>
              See all 6 tones →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="text-sm text-ink/45 hover:text-ink"
            onClick={() => {
              setFundIdx(0);
              setStep("fundamentals");
            }}
          >
            ← Fundamentals
          </button>
          <p className="text-xs font-semibold text-ink/45">Lesson 1 of 3</p>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          <span className="h-1.5 flex-1 rounded-full bg-coral" />
          <span className="h-1.5 flex-1 rounded-full bg-ink/10" />
          <span className="h-1.5 flex-1 rounded-full bg-ink/10" />
        </div>
        <div className="mt-4">
          <BrandMark />
        </div>
        <h1 className="mt-3 font-display text-3xl text-ink">Vietnamese Tones</h1>
        <p className="mt-0.5 font-display text-lg text-coral">(Dấu Thanh)</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Vietnamese has 6 tones. The tone changes how a word sounds and its meaning.
        </p>
      </header>

      <section className="ami-card mb-4 px-4 py-3">
        <p className="quiet-label">Dialect for listening</p>
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
          Southern hỏi/ngã often merge — listening never marks a legitimate merge as wrong.
        </p>
      </section>

      <ul className="space-y-2.5">
        {TONE_CARDS.map((card) => {
          const rec = state.lessons[card.id];
          const done = Boolean(rec?.mastered);
          return (
            <li key={card.id}>
              <Link
                href={`/dau-thanh/${card.id}`}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition hover:ring-1 hover:ring-coral/35 ${card.rowClass}`}
              >
                <span className="w-16 shrink-0">
                  <span className="block font-display text-base capitalize text-ink">
                    {card.nameVi}
                  </span>
                  <span className="block text-[11px] text-ink/45">({card.nameEn})</span>
                </span>
                <span className="font-hand text-2xl text-ink" lang="vi">
                  {card.written}
                </span>
                <ToneRowContour path={card.pitchPath} className={card.accentClass} />
                <span className="min-w-0 flex-1 text-[11px] leading-snug text-ink/55">
                  {card.voiceCueEn}
                </span>
                <ListenControls text={card.utterance} compact className="shrink-0" />
                {done ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-coral">
                    ✓
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mt-4 rounded-2xl bg-[#f6ebe3] px-4 py-4">
        <p className="font-display text-lg text-ink">Good to know</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
          <li>· There are 6 tones, but 5 written marks.</li>
          <li>· Ngang has no mark (ma).</li>
          <li>· The marks show the direction of your voice (a guide).</li>
        </ul>
      </section>

      <p className="mt-3 text-center text-xs text-ink/45">
        {mastered} / 6 mastered · ≥{Math.round(TONE_MASTERY_THRESHOLD * 100)}% quiz
      </p>

      <div className="mt-4 space-y-2">
        <Link href={continueHref} className="teacher-btn-primary flex w-full justify-center">
          Start Practice →
        </Link>
        <Link
          href="/dau-thanh/mastery"
          className={`teacher-btn-secondary flex w-full justify-center text-sm ${
            allTonesMastered(state) ? "" : "opacity-80"
          }`}
        >
          Final mastery test
          {state.masteryTest.passed ? " · Passed" : ""}
        </Link>
        <Link href="/danh-van" className="block text-center text-sm text-ink/45 underline-offset-2 hover:underline">
          Next unit · Đánh Vần
        </Link>
      </div>
    </div>
  );
}
