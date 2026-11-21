"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SpeakCompareAssess } from "@/components/phonics/path/SpeakCompareAssess";
import { speakVietnamese } from "@/lib/audio";
import { getPackWord } from "@/lib/vocabulary";
import {
  buildApplyChoices,
  completeEssentialLesson,
  getEssentialLesson,
  getEssentialSentence,
  isEssentialLessonUnlocked,
  loadSentencesProgress,
  markStageDone,
  nextSentenceInLesson,
  SENTENCE_STAGES,
  SENTENCES_PRONOUN_NOTE,
  type SentenceStage,
} from "@/lib/sentences";

type Props = { lessonId: string; sentenceId: string };

const STAGE_LABEL: Record<SentenceStage, string> = {
  "look-listen": "Look & Listen",
  words: "Understand each word",
  "danh-van": "Đánh Vần",
  speak: "Speak & Compare",
  apply: "Apply",
};

export function SentenceFlowClient({ lessonId, sentenceId }: Props) {
  const lesson = getEssentialLesson(lessonId);
  const sentence = getEssentialSentence(sentenceId);
  const unlocked = useMemo(
    () => isEssentialLessonUnlocked(lessonId, loadSentencesProgress()),
    [lessonId],
  );
  const [stageIdx, setStageIdx] = useState(0);
  const [showEn, setShowEn] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [applyChoices] = useState(() =>
    sentence ? buildApplyChoices(sentence) : { choices: [], correctEn: "" },
  );
  const [applyDone, setApplyDone] = useState(false);
  const [applyHint, setApplyHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  if (!lesson || !sentence || sentence.lessonId !== lessonId) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Sentence not found.</p>
        <Link href="/sentences" className="teacher-btn-secondary mt-4 inline-block">
          Sentences map
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl text-ink">Locked</h1>
        <p className="mt-2 text-ink/60">Finish the previous sentence lesson first.</p>
        <Link href="/sentences" className="teacher-btn-secondary mt-4 inline-block">
          Sentences map
        </Link>
      </div>
    );
  }

  const stage = SENTENCE_STAGES[stageIdx]!;

  function advanceStage() {
    markStageDone(sentenceId, stage);
    if (stageIdx + 1 >= SENTENCE_STAGES.length) {
      completeEssentialLesson(lessonId);
      setFinished(true);
      return;
    }
    setStageIdx((i) => i + 1);
    setSelectedWord(null);
    setApplyHint(null);
  }

  if (finished) {
    const next = nextSentenceInLesson(lessonId, sentenceId);
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <h1 className="mt-6 font-display text-3xl text-ink">Sentence done</h1>
        <p className="mt-2 text-ink/60" lang="vi">
          {sentence.vi}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {next ? (
            <Link
              href={`/sentences/${lessonId}/${next.id}`}
              className="teacher-btn-primary w-full text-center"
            >
              Next sentence
            </Link>
          ) : (
            <Link href="/sentences" className="teacher-btn-primary w-full text-center">
              Lesson map
            </Link>
          )}
          <Link href="/sentences" className="teacher-btn-secondary w-full text-center">
            All sentences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">
            {lesson.titleEn} · {sentence.order}/50 · {STAGE_LABEL[stage]}
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink" lang="vi">
            {sentence.vi}
          </h1>
          {showEn ? <p className="mt-1 text-sm text-ink/55">{sentence.en}</p> : null}
          <p className="mt-2 text-[11px] text-ink/40">
            Southern VI · content {sentence.contentStatus.replace("_", " ")} · audio{" "}
            {sentence.audioMode === "tts_temporary" ? "TTS (temporary)" : "native"}
          </p>
        </div>
        <Link href={`/sentences/${lessonId}`} className="teacher-btn-secondary px-3 py-2 text-sm">
          Lesson
        </Link>
      </header>

      {stage === "look-listen" ? (
        <section className="rounded-2xl bg-soft px-4 py-5">
          <div className="mx-auto flex aspect-[4/3] max-w-sm items-center justify-center rounded-2xl bg-paper">
            <p className="px-4 text-center font-display text-3xl text-ink" lang="vi">
              {sentence.vi}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="teacher-btn-primary"
              onClick={() => void speakVietnamese(sentence.vi)}
            >
              Play
            </button>
            <button
              type="button"
              className="teacher-btn-secondary"
              onClick={() => void speakVietnamese(sentence.vi, { slow: true, rate: 0.75 })}
            >
              0.75×
            </button>
            <button
              type="button"
              className="teacher-btn-secondary"
              onClick={() => setShowEn((v) => !v)}
            >
              {showEn ? "Hide EN" : "Show EN"}
            </button>
          </div>
          <p className="mt-3 text-xs text-ink/45">{SENTENCES_PRONOUN_NOTE}</p>
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={advanceStage}>
            Continue
          </button>
        </section>
      ) : null}

      {stage === "words" ? (
        <section className="rounded-2xl bg-soft px-4 py-5">
          <p className="text-sm text-ink/60">Tap a word. Multisyllable units stay together.</p>
          <div className="mt-4 flex flex-wrap gap-2" lang="vi">
            {sentence.words.map((w, i) =>
              w.kind === "punct" ? (
                <span key={`${w.surface}-${i}`} className="text-ink/40">
                  {w.surface}
                </span>
              ) : (
                <button
                  key={`${w.surface}-${i}`}
                  type="button"
                  className={`rounded-xl px-3 py-2 text-lg transition ${
                    selectedWord === w.surface
                      ? "bg-coral text-white"
                      : "bg-paper text-ink hover:bg-paper/80"
                  }`}
                  onClick={() => {
                    setSelectedWord(w.surface);
                    void speakVietnamese(w.surface);
                  }}
                >
                  {w.surface}
                </button>
              ),
            )}
          </div>
          {selectedWord ? (
            <WordDetail surface={selectedWord} sentenceId={sentenceId} />
          ) : (
            <p className="mt-4 text-sm text-ink/45">Select a word to see meaning / Top 100 link.</p>
          )}
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={advanceStage}>
            Continue
          </button>
        </section>
      ) : null}

      {stage === "danh-van" ? (
        <section className="rounded-2xl bg-soft px-4 py-5">
          <p className="text-sm text-ink/60">
            Reuse Đánh Vần — play each content word slowly. Authored letter sequences stay in the
            Đánh Vần path (never invented here).
          </p>
          <ul className="mt-4 space-y-2">
            {sentence.words
              .filter((w) => w.kind === "word")
              .map((w, i) => (
                <li key={`${w.surface}-${i}`}>
                  <button
                    type="button"
                    className="teacher-btn-secondary w-full text-left"
                    lang="vi"
                    onClick={() => void speakVietnamese(w.surface, { slow: true })}
                  >
                    {w.surface}
                  </button>
                </li>
              ))}
          </ul>
          <Link href="/danh-van" className="mt-3 inline-block text-sm font-medium text-coral underline-offset-2 hover:underline">
            Open Đánh Vần hub
          </Link>
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={advanceStage}>
            Continue
          </button>
        </section>
      ) : null}

      {stage === "speak" ? (
        <section className="rounded-2xl bg-soft px-4 py-5">
          <p className="mb-3 text-sm text-ink/60">
            Deepgram match — honest feedback, no invented tone scores.
          </p>
          <SpeakCompareAssess
            itemId={sentence.id}
            expectedText={sentence.vi.replace(/[.…?!]/g, "").trim() || sentence.vi}
            onPlayNative={() => void speakVietnamese(sentence.vi)}
            onPracticed={advanceStage}
          />
          <button type="button" className="teacher-btn-secondary mt-4 w-full" onClick={advanceStage}>
            Skip for now
          </button>
        </section>
      ) : null}

      {stage === "apply" ? (
        <section className="rounded-2xl bg-soft px-4 py-5">
          <p className="text-sm text-ink/60">What does this mean?</p>
          <p className="mt-2 font-display text-xl text-ink" lang="vi">
            {sentence.vi}
          </p>
          <div className="mt-4 grid gap-2">
            {applyChoices.choices.map((c) => (
              <button
                key={c}
                type="button"
                className="teacher-btn-secondary w-full text-left"
                disabled={applyDone}
                onClick={() => {
                  if (c === applyChoices.correctEn) {
                    setApplyDone(true);
                    setApplyHint("Correct!");
                    window.setTimeout(() => advanceStage(), 400);
                  } else {
                    setApplyHint("Not quite — try again.");
                  }
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {applyHint ? (
            <p className="mt-3 text-sm text-ink/65" role="status">
              {applyHint}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function WordDetail({ surface, sentenceId }: { surface: string; sentenceId: string }) {
  const sentence = getEssentialSentence(sentenceId);
  const token = sentence?.words.find((w) => w.kind === "word" && w.surface === surface);
  const pack =
    token && token.kind === "word" && token.packWordId
      ? getPackWord(token.packWordId)
      : undefined;

  return (
    <div className="mt-4 rounded-xl bg-paper px-3 py-3 text-sm text-ink/70">
      <p className="font-display text-xl text-ink" lang="vi">
        {surface}
      </p>
      {pack ? (
        <p className="mt-1">
          Top 100: <span className="font-medium text-ink">{pack.en}</span>{" "}
          <Link href="/vocab/pack" className="text-coral underline-offset-2 hover:underline">
            ({pack.id})
          </Link>
        </p>
      ) : (
        <p className="mt-1 text-ink/50">Not in First 100 — gloss pending native review.</p>
      )}
    </div>
  );
}
