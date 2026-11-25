"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { PitchCalibration } from "@/components/tones/PitchCalibration";
import { ToneListeningQuiz } from "@/components/tones/ToneListeningQuiz";
import { ToneMarkAnimation } from "@/components/tones/ToneMarkAnimation";
import { ToneOverview } from "@/components/tones/ToneOverview";
import { TonePitchGraph } from "@/components/tones/TonePitchGraph";
import { TonePronunciationPractice } from "@/components/tones/TonePronunciationPractice";
import { ToneTracingPractice } from "@/components/tones/ToneTracingPractice";
import { markJourneyLessonComplete } from "@/lib/journey";
import { recordExerciseResult, loadPathProgress } from "@/lib/phonics/learningPath";
import {
  DIACRITIC_CHAINS,
  DIACRITIC_RULES,
  VOWEL_DIACRITICS,
  allTonesMastered,
  continueToneHref,
  loadToneProgress,
  markToneChapterDone,
  pitchPathFor,
  setToneDialect,
  TONE_CARDS,
  TONE_CHAPTERS,
  tonesMasteredCount,
  type ToneChapterId,
  type ToneDialect,
  type ToneId,
  type ToneProgressState,
} from "@/lib/tones";

type PracticeMode = "menu" | "listen" | "graph" | "trace" | "say" | "done";

function chapterFromQuery(): ToneChapterId | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("chapter");
  if (
    q === "intro" ||
    q === "pitch" ||
    q === "tones" ||
    q === "regional" ||
    q === "diacritics" ||
    q === "practice"
  ) {
    return q;
  }
  return null;
}

function firstIncomplete(state: ToneProgressState): ToneChapterId {
  for (const ch of TONE_CHAPTERS) {
    if (!state.chaptersDone[ch.id]) return ch.id;
  }
  return "practice";
}

export function ToneCourseClient() {
  const [state, setState] = useState<ToneProgressState | null>(null);
  const [chapter, setChapter] = useState<ToneChapterId>("intro");
  const [toneIdx, setToneIdx] = useState(0);
  const [practice, setPractice] = useState<PracticeMode>("menu");
  const [graphTarget, setGraphTarget] = useState<ToneId>("sac");
  const [graphPick, setGraphPick] = useState<string | null>(null);
  const [graphNote, setGraphNote] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadToneProgress();
    setState(loaded);
    setChapter(chapterFromQuery() ?? firstIncomplete(loaded));
    markJourneyLessonComplete("u2-l04");
  }, []);

  const graphChoices = useMemo(() => {
    const target = TONE_CARDS.find((c) => c.id === graphTarget) ?? TONE_CARDS[1]!;
    const distractors = TONE_CARDS.filter((c) => c.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    return [target, ...distractors].sort(() => Math.random() - 0.5);
  }, [graphTarget, practice]);

  if (!state) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading tones…</p>
      </div>
    );
  }

  const dialect = state.dialect;
  const card = TONE_CARDS[toneIdx]!;
  const mastered = tonesMasteredCount(state);
  const chMeta = TONE_CHAPTERS.find((c) => c.id === chapter)!;

  function go(next: ToneChapterId) {
    setChapter(next);
    setPractice("menu");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("chapter", next);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function finishChapter(id: ToneChapterId, next: ToneChapterId) {
    setState(markToneChapterDone(id));
    go(next);
  }

  function setDialect(d: ToneDialect) {
    setState(setToneDialect(d));
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/learn" className="text-sm text-ink/45 hover:text-ink">
            ← Learn
          </Link>
          <p className="text-xs font-semibold text-ink/45">
            Chapter {chMeta.order} of {TONE_CHAPTERS.length}
          </p>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {TONE_CHAPTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`h-1.5 flex-1 rounded-full ${
                c.order < chMeta.order || state.chaptersDone[c.id]
                  ? "bg-coral"
                  : c.id === chapter
                    ? "bg-coral/60"
                    : "bg-ink/10"
              }`}
              aria-label={c.titleEn}
              onClick={() => go(c.id)}
            />
          ))}
        </div>
        <div className="mt-4">
          <BrandMark />
        </div>
      </header>

      {chapter === "intro" ? (
        <ToneOverview
          dialect={dialect}
          onContinue={() => finishChapter("intro", "pitch")}
        />
      ) : null}

      {chapter === "pitch" ? (
        <PitchCalibration
          dialect={dialect}
          baselineHz={state.baselinePitchHz}
          onDone={() => finishChapter("pitch", "tones")}
          onSkip={() => finishChapter("pitch", "tones")}
        />
      ) : null}

      {chapter === "tones" ? (
        <div className="space-y-4">
          <header>
            <p className="quiet-label">Chapter 3 · Tone {card.order} / 6</p>
            <h1 className="mt-1 font-display text-2xl text-ink">
              <span className="capitalize" style={{ color: card.accentStroke }}>
                {card.nameVi}
              </span>
              <span className="text-ink/70">
                {" "}
                ({card.id === "ngang" ? "—" : card.markChar}) –{" "}
                {card.nameEn.charAt(0).toUpperCase() + card.nameEn.slice(1)}
              </span>
            </h1>
          </header>

          <div className={`rounded-2xl px-4 py-4 ${card.rowClass}`}>
            <p className="font-hand text-5xl text-ink" lang="vi">
              {card.written}
            </p>
            <p className="mt-1 text-sm text-ink/55">{card.meaningEn}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{card.teachEn}</p>
          </div>

          <TonePitchGraph
            showNaturalPitch
            curves={[
              {
                path: pitchPathFor(card, dialect),
                color: card.accentStroke,
                label: card.nameVi,
              },
            ]}
          />

          <ToneMarkAnimation
            strokePath={card.markStrokePath}
            markChar={card.markChar}
            guideEn={card.strokeGuideEn}
            accent={card.accentStroke}
            empty={card.id === "ngang"}
          />

          <p className="text-xs text-ink/50">
            {dialect === "southern" ? card.southernNoteEn : card.northernNoteEn}
          </p>

          <div className="flex flex-col gap-2">
            <Link
              href={`/dau-thanh/${card.id}`}
              className="teacher-btn-primary w-full text-center"
            >
              Practice this tone (listen · write · say · quiz)
            </Link>
            {toneIdx < TONE_CARDS.length - 1 ? (
              <button
                type="button"
                className="teacher-btn-secondary w-full"
                onClick={() => setToneIdx((i) => i + 1)}
              >
                Next tone →
              </button>
            ) : (
              <button
                type="button"
                className="teacher-btn-secondary w-full"
                onClick={() => finishChapter("tones", "regional")}
              >
                Regional accents →
              </button>
            )}
          </div>
        </div>
      ) : null}

      {chapter === "regional" ? (
        <div className="space-y-4">
          <header>
            <p className="quiet-label">Chapter 4</p>
            <h1 className="mt-1 font-display text-3xl text-ink">Southern & Northern</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              Vietnamese has six written tone categories, but some regional accents merge hỏi and
              ngã in speech. We never penalize a valid regional pronunciation — and we do not require
              you to tell hỏi and ngã apart by ear when your selected speaker merges them.
            </p>
          </header>
          <section className="ami-card px-4 py-4">
            <p className="quiet-label">Listening accent</p>
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
                    dialect === id ? "bg-coral text-white" : "bg-soft text-ink/60"
                  }`}
                  onClick={() => setDialect(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-2 gap-2">
            {(["hoi", "nga"] as const).map((id) => {
              const c = TONE_CARDS.find((x) => x.id === id)!;
              return (
                <div key={id} className={`rounded-2xl px-3 py-3 ${c.rowClass}`}>
                  <p className="font-display capitalize text-ink">{c.nameVi}</p>
                  <p className="font-hand text-2xl" style={{ color: c.accentStroke }} lang="vi">
                    {c.written}
                  </p>
                  <TonePitchGraph
                    height={100}
                    showNaturalPitch={false}
                    curves={[{ path: pitchPathFor(c, dialect), color: c.accentStroke }]}
                  />
                  <p className="mt-1 text-[11px] text-ink/55">
                    {dialect === "southern" ? c.southernNoteEn : c.northernNoteEn}
                  </p>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="teacher-btn-primary w-full"
            onClick={() => finishChapter("regional", "diacritics")}
          >
            Tone marks vs vowel marks →
          </button>
        </div>
      ) : null}

      {chapter === "diacritics" ? (
        <div className="space-y-4">
          <header>
            <p className="quiet-label">Chapter 5</p>
            <h1 className="mt-1 font-display text-3xl text-ink">Tone marks vs vowel marks</h1>
            <p className="mt-2 text-sm text-ink/70">
              Tone marks change the tone. Vowel diacritics are part of the vowel and change its sound.
            </p>
          </header>
          <div className="flex flex-wrap gap-2">
            {VOWEL_DIACRITICS.map((v) => (
              <span
                key={v.letter}
                className="rounded-xl bg-soft px-3 py-2 font-hand text-2xl text-ink"
                lang="vi"
                title={v.glossEn}
              >
                {v.letter}
              </span>
            ))}
          </div>
          <ul className="space-y-2">
            {DIACRITIC_CHAINS.map((chain) => (
              <li key={chain.steps.join("-")} className="ami-card flex flex-wrap items-center gap-2 px-4 py-3">
                {chain.steps.map((s, i) => (
                  <span key={s} className="inline-flex items-center gap-2">
                    <span className="font-hand text-3xl text-ink" lang="vi">
                      {s}
                    </span>
                    {i < chain.steps.length - 1 ? (
                      <span className="text-ink/35">→</span>
                    ) : null}
                  </span>
                ))}
                <span className="w-full text-xs text-ink/50">{chain.noteEn}</span>
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-sm text-ink/65">
            {DIACRITIC_RULES.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
          <button
            type="button"
            className="teacher-btn-primary w-full"
            onClick={() => finishChapter("diacritics", "practice")}
          >
            Unlock practice →
          </button>
        </div>
      ) : null}

      {chapter === "practice" ? (
        <div className="space-y-4">
          <header>
            <p className="quiet-label">Chapter 6</p>
            <h1 className="mt-1 font-display text-3xl text-ink">Practice & mastery</h1>
            <p className="mt-1 text-sm text-ink/55">
              {mastered} / 6 tones mastered ·{" "}
              {state.masteryTest.passed ? "Final quiz passed" : "Final quiz unlocked"}
            </p>
          </header>

          {practice === "menu" ? (
            <div className="space-y-2">
              {(
                [
                  ["listen", "A · Listen & choose"],
                  ["graph", "B · Match the graph"],
                  ["trace", "C · Write the tone"],
                  ["say", "D · Pronounce the tone"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="teacher-btn-secondary w-full justify-start"
                  onClick={() => {
                    if (id === "graph") {
                      setGraphTarget(
                        TONE_CARDS[Math.floor(Math.random() * TONE_CARDS.length)]!.id,
                      );
                      setGraphPick(null);
                      setGraphNote(null);
                    }
                    setPractice(id);
                  }}
                >
                  {label}
                </button>
              ))}
              <Link href="/dau-thanh/mastery" className="teacher-btn-primary flex w-full justify-center">
                E · Final quiz (12 · ≥80%)
              </Link>
              <Link
                href={continueToneHref(state)}
                className="block text-center text-sm text-ink/45 underline-offset-2 hover:underline"
              >
                Continue individual tone lessons
              </Link>
              <Link
                href="/danh-van"
                className="block text-center text-sm text-ink/45 underline-offset-2 hover:underline"
              >
                Next unit · Đánh Vần
              </Link>
            </div>
          ) : null}

          {practice === "listen" ? (
            <ToneListeningQuiz
              dialect={dialect}
              onComplete={(correct, total) => {
                const path = loadPathProgress();
                recordExerciseResult(path, ["tone-six-ma", "listen-discriminate"], correct / total >= 0.8);
                setState(markToneChapterDone("practice"));
                setPractice("done");
              }}
            />
          ) : null}

          {practice === "graph" ? (
            <section className="space-y-3">
              <p className="quiet-label">Exercise B · Match the graph</p>
              <p className="font-display text-xl text-ink">
                Which graph is{" "}
                <span className="capitalize">
                  {TONE_CARDS.find((c) => c.id === graphTarget)?.nameVi}
                </span>
                ?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {graphChoices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={Boolean(graphNote)}
                    className={`rounded-2xl px-3 py-2 text-left ${c.rowClass} ${
                      graphPick === c.id ? "ring-2 ring-coral" : ""
                    }`}
                    onClick={() => {
                      setGraphPick(c.id);
                      const ok = c.id === graphTarget;
                      setGraphNote(ok ? "Correct." : `That was ${c.nameVi}.`);
                      if (!ok) {
                        const path = loadPathProgress();
                        recordExerciseResult(path, [c.skillId], false);
                      }
                    }}
                  >
                    <TonePitchGraph
                      height={88}
                      showNaturalPitch={false}
                      curves={[{ path: pitchPathFor(c, dialect), color: c.accentStroke }]}
                    />
                    <span className="text-xs text-ink/45">{c.written}</span>
                  </button>
                ))}
              </div>
              {graphNote ? (
                <button
                  type="button"
                  className="teacher-btn-primary w-full"
                  onClick={() => setPractice("menu")}
                >
                  Back to practice
                </button>
              ) : null}
              {graphNote ? <p className="text-sm text-ink/70">{graphNote}</p> : null}
            </section>
          ) : null}

          {practice === "trace" ? (
            <ToneTracingPractice
              toneId={card.id}
              onDone={() => setPractice("menu")}
            />
          ) : null}

          {practice === "say" ? (
            <>
              <TonePronunciationPractice
                toneId={card.id}
                dialect={dialect}
                baselineHz={state.baselinePitchHz}
              />
              <button
                type="button"
                className="teacher-btn-secondary w-full"
                onClick={() => setPractice("menu")}
              >
                Back
              </button>
            </>
          ) : null}

          {practice === "done" ? (
            <div className="ami-card space-y-3 px-4 py-5 text-center">
              <p className="font-display text-2xl text-ink">Nice work</p>
              <button
                type="button"
                className="teacher-btn-primary w-full"
                onClick={() => setPractice("menu")}
              >
                More practice
              </button>
            </div>
          ) : null}

          {!allTonesMastered(state) ? (
            <p className="text-center text-xs text-ink/45">
              Tip: finish each tone’s lesson quiz (≥80%) for mastery badges.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
