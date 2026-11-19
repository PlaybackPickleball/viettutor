"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SyllableBuilder } from "@/components/phonics/SyllableBuilder";
import { ToneFamilyBoard } from "@/components/phonics/ToneFamilyBoard";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { usePracticeClock } from "@/hooks/usePracticeClock";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import {
  getNextPhonicsLesson,
  getPhonicsLesson,
  isLessonComplete,
  isLessonUnlocked,
  loadPhonicsProgress,
  markLessonAttempted,
  markLessonComplete,
  type PhonicsLesson,
  type PhonicsProgressState,
} from "@/lib/phonics";
import { WordGloss } from "@/components/phonics/WordGloss";
import { resolveWordArt } from "@/lib/phonics/wordArt";

export function PhonicsLessonClient({ lesson }: { lesson: PhonicsLesson }) {
  const [progress, setProgress] = useState<PhonicsProgressState | null>(null);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  usePracticeClock(true);

  useEffect(() => {
    setProgress(loadPhonicsProgress());
    setReady(false);
    setFeedback(null);
  }, [lesson.id]);

  const next = getNextPhonicsLesson(lesson.id);
  const done = progress ? isLessonComplete(progress, lesson.id) : false;
  const unlocked = progress ? isLessonUnlocked(progress, lesson.id) : lesson.order <= 1;

  const reviewLessons = useMemo(() => {
    if (!lesson.reviewOf?.length) return [];
    return lesson.reviewOf
      .map((id) => getPhonicsLesson(id))
      .filter((l): l is PhonicsLesson => Boolean(l));
  }, [lesson.reviewOf]);

  function attempt() {
    setProgress(markLessonAttempted(loadPhonicsProgress(), lesson.id));
  }

  function complete() {
    setReady(true);
    setProgress(markLessonComplete(loadPhonicsProgress(), lesson.id));
  }

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading lesson…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-8 font-display text-2xl text-ink">Lesson locked</p>
        <p className="mt-2 text-ink/60">Finish the previous Đánh Vần lesson to continue.</p>
        <Link href="/danh-van" className="teacher-btn-primary mt-6 w-full text-center">
          Back to Đánh Vần
        </Link>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">
            Lesson {lesson.order} · Đánh Vần
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">{lesson.titleEn}</h1>
          <p className="text-sm text-ink/55" lang="vi">
            {lesson.titleVi}
          </p>
        </div>
        <Link href="/danh-van" className="teacher-btn-secondary px-4 py-2 text-sm">
          All lessons
        </Link>
      </header>

      <p className="mb-2 text-base text-ink/70">{lesson.explanationEn}</p>
      <p className="mb-2 text-sm text-ink/50" lang="vi">
        {lesson.explanationVi}
      </p>
      {lesson.meaningEn && lesson.kind !== "build" ? (
        resolveWordArt(lesson.target) ? (
          <WordGloss
            vi={lesson.target}
            en={lesson.meaningEn}
            size="md"
            stacked={false}
            className="mb-6"
            viClassName="font-hand text-lg text-ink"
            enClassName="text-sm leading-snug text-ink/55"
          />
        ) : (
          <p className="mb-6 text-sm leading-snug text-ink/55" lang="en">
            {lesson.target ? (
              <>
                <span className="font-hand text-lg text-ink" lang="vi">
                  {lesson.target}
                </span>
                <span className="mx-1.5 text-ink/30">·</span>
              </>
            ) : null}
            {lesson.meaningEn}
          </p>
        )
      ) : (
        <div className="mb-6" />
      )}

      {lesson.kind === "build" && lesson.steps ? (
        <SyllableBuilder
          steps={lesson.steps}
          target={lesson.target}
          meaningEn={lesson.meaningEn}
          onAttempt={attempt}
          onComplete={() => setReady(true)}
        />
      ) : null}

      {(lesson.kind === "tone-family" || lesson.kind === "listen-tone") && lesson.toneFamily ? (
        <>
          <ToneFamilyBoard
            cards={lesson.toneFamily}
            onAttempt={attempt}
            onHeardAll={() => setReady(true)}
          />
          {lesson.kind === "listen-tone" ? (
            <ToneQuiz
              cards={lesson.toneFamily}
              onAttempt={attempt}
              onSolved={() => setReady(true)}
            />
          ) : null}
        </>
      ) : null}

      {lesson.kind === "recognition" && lesson.steps ? (
        <RecognitionDrill
          steps={lesson.steps}
          options={lesson.options ?? []}
          onAttempt={attempt}
          onSolved={() => setReady(true)}
        />
      ) : null}

      {lesson.kind === "read" && lesson.readWords ? (
        <ReadWords
          words={lesson.readWords}
          onAttempt={attempt}
          onHeardAll={() => setReady(true)}
        />
      ) : null}

      {(lesson.kind === "free-build" || lesson.kind === "review") && reviewLessons.length ? (
        <div className="space-y-3">
          <p className="text-sm text-ink/60">
            Open any verified lesson below. Sequences stay authored — nothing is invented.
          </p>
          <ul className="space-y-2">
            {reviewLessons.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/danh-van/lesson/${item.id}`}
                  className="ami-card flex items-center justify-between px-4 py-3 transition hover:bg-paper"
                  onClick={attempt}
                >
                  <span>
                    <span className="font-medium text-ink">{item.titleEn}</span>
                    <span className="mt-0.5 block text-xs text-ink/45" lang="vi">
                      {item.titleVi}
                    </span>
                    {item.meaningEn ? (
                      <span className="mt-0.5 block text-xs text-ink/40" lang="en">
                        {item.target ? `${item.target} · ` : ""}
                        {item.meaningEn}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-coral">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className="teacher-btn-secondary w-full" onClick={() => setReady(true)}>
            I reviewed these — continue
          </button>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 text-sm text-ink/70">{feedback}</p> : null}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <button
          type="button"
          className={`teacher-btn-primary w-full ${ready || done ? "" : "opacity-40"}`}
          disabled={!ready && !done}
          onClick={() => {
            complete();
            setFeedback("Lesson stamped. Progress saved on this device.");
          }}
        >
          {done ? "Completed ★" : "Mark lesson complete"}
        </button>
        {next ? (
          <Link
            href={`/danh-van/lesson/${next.id}`}
            className={`teacher-btn-secondary w-full text-center ${
              done || ready ? "" : "pointer-events-none opacity-40"
            }`}
          >
            Next: {next.titleEn}
          </Link>
        ) : (
          <Link href="/danh-van" className="teacher-btn-secondary w-full text-center">
            Back to Đánh Vần home
          </Link>
        )}
      </div>
    </div>
  );
}

function RecognitionDrill({
  steps,
  options,
  onAttempt,
  onSolved,
}: {
  steps: NonNullable<PhonicsLesson["steps"]>;
  options: string[];
  onAttempt: () => void;
  onSolved: () => void;
}) {
  const [prompt, setPrompt] = useState(steps[0]);
  const [msg, setMsg] = useState<string | null>(null);

  async function playPrompt() {
    onAttempt();
    const step = steps[Math.floor(Math.random() * steps.length)] ?? steps[0];
    setPrompt(step);
    setMsg(null);
    try {
      await speakVietnamese(step.utterance);
    } catch {
      /* continue */
    }
  }

  function choose(opt: string) {
    onAttempt();
    if (opt === prompt.display) {
      setMsg("Correct — teaching sound matched.");
      onSolved();
    } else {
      setMsg(`Not ${opt}. That teaching sound was ${prompt.utterance}.`);
    }
  }

  return (
    <div className="space-y-4">
      <button type="button" className="teacher-btn-primary w-full" onClick={() => void playPrompt()}>
        Play teaching sound
      </button>
      <div className="grid grid-cols-4 gap-2">
        {options.map((opt) => {
          const gloss = steps.find((s) => s.display === opt)?.glossEn;
          return (
            <button
              key={opt}
              type="button"
              className="ami-card flex flex-col items-center py-3"
              onClick={() => choose(opt)}
            >
              <span className="font-hand text-3xl text-ink" lang="vi">
                {opt}
              </span>
              {gloss ? (
                <span className="mt-1 px-1 text-center text-[10px] leading-tight text-ink/40" lang="en">
                  {gloss}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {msg ? <p className="text-sm text-ink/70">{msg}</p> : null}
      <button type="button" className="teacher-btn-secondary" onClick={() => stopSpeaking()}>
        Stop
      </button>
    </div>
  );
}

function ToneQuiz({
  cards,
  onAttempt,
  onSolved,
}: {
  cards: NonNullable<PhonicsLesson["toneFamily"]>;
  onAttempt: () => void;
  onSolved: () => void;
}) {
  const [answer, setAnswer] = useState(cards[0]);
  const [msg, setMsg] = useState<string | null>(null);

  async function play() {
    onAttempt();
    const card = cards[Math.floor(Math.random() * cards.length)] ?? cards[0];
    setAnswer(card);
    setMsg(null);
    try {
      await speakVietnamese(card.utterance);
    } catch {
      /* */
    }
  }

  return (
    <div className="mt-6 space-y-3 ami-card px-4 py-4">
      <p className="quiet-label">Quick listen quiz</p>
      <button type="button" className="teacher-btn-primary w-full" onClick={() => void play()}>
        Play a tone
      </button>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className="rounded-2xl bg-soft py-3 text-sm"
            onClick={() => {
              onAttempt();
              if (card.id === answer.id) {
                setMsg(`Yes — ${card.nameVi} (${card.written}).`);
                onSolved();
              } else {
                setMsg(`That was ${answer.nameVi} · ${answer.written}.`);
              }
            }}
          >
            {card.nameVi}
          </button>
        ))}
      </div>
      {msg ? <p className="text-sm text-ink/70">{msg}</p> : null}
    </div>
  );
}

function ReadWords({
  words,
  onAttempt,
  onHeardAll,
}: {
  words: NonNullable<PhonicsLesson["readWords"]>;
  onAttempt: () => void;
  onHeardAll: () => void;
}) {
  const [heard, setHeard] = useState<Record<string, boolean>>({});

  async function play(vi: string) {
    onAttempt();
    try {
      await speakVietnamese(vi);
    } catch {
      /* */
    }
    const next = { ...heard, [vi]: true };
    setHeard(next);
    if (words.every((w) => next[w.vi])) onHeardAll();
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {words.map((w) => (
          <li key={w.vi}>
            <button
              type="button"
              onClick={() => void play(w.vi)}
              className={`ami-card flex w-full items-center justify-between px-4 py-3 text-left ${
                heard[w.vi] ? "ring-1 ring-coral/35" : ""
              }`}
            >
              {resolveWordArt(w.vi) ? (
                <WordGloss
                  vi={w.vi}
                  en={w.en}
                  size="sm"
                  stacked={false}
                  viClassName="font-hand text-3xl text-ink"
                  enClassName="mt-1 text-sm leading-snug text-ink/50"
                />
              ) : (
                <span>
                  <span className="font-hand text-3xl text-ink" lang="vi">
                    {w.vi}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-ink/50" lang="en">
                    {w.en}
                  </span>
                </span>
              )}
              <span className="text-coral text-sm">Listen</span>
            </button>
          </li>
        ))}
      </ul>
      <LocalMicRecorder label="Record a reading" />
    </div>
  );
}
