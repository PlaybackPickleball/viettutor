"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ListenAndType } from "@/components/vocabulary/mastery/ListenAndType";
import { getPackWord, packImageUrl } from "@/lib/vocabulary";
import {
  completeDailyReviewSession,
  dueMasteryWordIds,
  loadMasteryState,
  pullMasteryFromServer,
  recordDailyReviewItem,
  recordListenAndType,
  saveMasteryState,
  type QuizQuestionKind,
} from "@/lib/vocabulary/mastery";

type Mode = "image" | "listen-type";

export function VocabDailyReviewClient() {
  const [ids, setIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("listen-type");
  const [done, setDone] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    void (async () => {
      await pullMasteryFromServer();
      setIds(dueMasteryWordIds());
    })();
  }, []);

  const word = useMemo(() => {
    const id = ids[index];
    return id ? getPackWord(id) : null;
  }, [ids, index]);

  function advance(correct: boolean, kind: QuizQuestionKind, listenType = false) {
    const id = ids[index];
    if (!id) return;
    let state = loadMasteryState();
    const before = state.totalXp;
    state = listenType
      ? recordListenAndType(state, id, correct)
      : recordDailyReviewItem(state, id, correct, kind);
    if (index + 1 >= ids.length) {
      state = completeDailyReviewSession(state);
      saveMasteryState(state);
      setXpGained((x) => x + (state.totalXp - before));
      setDone(true);
      return;
    }
    saveMasteryState(state);
    setXpGained((x) => x + (state.totalXp - before));
    setIndex((i) => i + 1);
    setMode(index % 2 === 0 ? "image" : "listen-type");
  }

  if (done) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <h1 className="mt-6 font-display text-3xl text-ink">Review complete</h1>
        <p className="mt-2 text-ink/60">
          {ids.length} word{ids.length === 1 ? "" : "s"} · +{xpGained} XP today
        </p>
        <Link href="/" className="teacher-btn-primary mt-6 inline-block w-full text-center">
          Home
        </Link>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <h1 className="mt-6 font-display text-3xl text-ink">Nothing due</h1>
        <p className="mt-2 text-ink/60">
          Finish a pack lesson quiz to schedule words for spaced review.
        </p>
        <Link href="/vocab/pack" className="teacher-btn-primary mt-6 inline-block w-full text-center">
          First 100 pack
        </Link>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">
            Daily Review · {index + 1}/{ids.length}
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">Vocabulary due</h1>
        </div>
        <Link href="/" className="teacher-btn-secondary px-3 py-2 text-sm">
          Home
        </Link>
      </header>

      {mode === "listen-type" ? (
        <ListenAndType word={word} onResult={(ok) => advance(ok, "typing", true)} />
      ) : (
        <div>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={packImageUrl(word)}
              alt=""
              width={1254}
              height={1254}
              className="absolute inset-0 h-full w-full object-contain object-center p-4"
            />
          </div>
          <p className="mt-3 text-center text-sm text-ink/55">What is this in Vietnamese?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="teacher-btn-primary"
              onClick={() => advance(true, "image")}
            >
              I know it
            </button>
            <button
              type="button"
              className="teacher-btn-secondary"
              onClick={() => advance(false, "image")}
            >
              Again
            </button>
          </div>
          <p className="mt-3 text-center font-display text-xl text-ink" lang="vi">
            {word.vi}
          </p>
          <p className="text-center text-sm text-ink/45">{word.en}</p>
        </div>
      )}
    </div>
  );
}
