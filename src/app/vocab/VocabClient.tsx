"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { speakVietnamese } from "@/lib/audio";
import {
  dueVocab,
  gradeVocabItem,
  isSongVocab,
  loadVocab,
  removeVocabItem,
  type SavedVocabItem,
} from "@/lib/vocab/store";

type Mode = "list" | "review";
type Filter = "all" | "songs";

export function VocabClient() {
  const [items, setItems] = useState<SavedVocabItem[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [filter, setFilter] = useState<Filter>("all");
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setItems(loadVocab());
  }, []);

  const visible = useMemo(
    () => (filter === "songs" ? items.filter(isSongVocab) : items),
    [items, filter],
  );
  const due = useMemo(() => dueVocab(visible), [visible]);
  const card = mode === "review" ? due[index] ?? null : null;

  function startReview() {
    setMode("review");
    setIndex(0);
    setRevealed(false);
  }

  function grade(next: "know" | "again") {
    if (!card) return;
    const updated = gradeVocabItem(card.id, next);
    setItems(updated);
    setRevealed(false);
    const remaining = dueVocab(filter === "songs" ? updated.filter(isSongVocab) : updated);
    if (remaining.length === 0) {
      setMode("list");
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(i, remaining.length - 1));
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl text-ink">Saved vocabulary</h1>
      <p className="mt-2 text-ink/60">
        Words from Scan & Read and songs. Self-grade flashcards — no AI score.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-2xl px-3 py-2 text-sm ${filter === "all" ? "bg-coral text-paper" : "bg-soft text-ink/70"}`}
          onClick={() => setFilter("all")}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          className={`rounded-2xl px-3 py-2 text-sm ${filter === "songs" ? "bg-coral text-paper" : "bg-soft text-ink/70"}`}
          onClick={() => setFilter("songs")}
        >
          From songs ({items.filter(isSongVocab).length})
        </button>
      </div>

      {mode === "list" ? (
        <>
          <button
            type="button"
            className="teacher-btn-primary mt-4 w-full"
            disabled={due.length === 0}
            onClick={startReview}
          >
            Review due ({due.length})
          </button>

          {visible.length === 0 ? (
            <div className="ami-card mt-6 px-4 py-6 text-sm text-ink/55">
              {filter === "songs"
                ? "No song words yet. Open Sing → Learn the Lyrics and save a word."
                : "No saved words yet. Scan text or save from a song lesson."}
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {visible.map((item) => (
                <li key={item.id} className="ami-card px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl text-ink" lang="vi">
                        {item.expression}
                      </p>
                      <p className="text-ink/60">{item.meaningEn}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-ink/40">
                        {isSongVocab(item) ? "Song" : "Scan"} · practiced {item.practiceCount}×
                      </p>
                      {item.originalSentence ? (
                        <p className="mt-2 text-xs text-ink/45" lang="vi">
                          From: {item.originalSentence}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="circle-btn"
                      aria-label="Listen"
                      onClick={() => void speakVietnamese(item.expression)}
                    >
                      ♪
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-sm text-coral"
                    onClick={() => setItems(removeVocabItem(item.id))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <section className="ami-card mt-6 px-4 py-6">
          <p className="quiet-label">
            Flashcard {Math.min(index + 1, due.length)} / {due.length}
          </p>
          {card ? (
            <>
              <p className="mt-4 text-center font-hand text-5xl text-ink" lang="vi">
                {card.expression}
              </p>
              <button
                type="button"
                className="teacher-btn-secondary mt-4 w-full"
                onClick={() => void speakVietnamese(card.expression)}
              >
                Listen
              </button>
              {revealed ? (
                <>
                  <p className="mt-6 text-center text-lg text-ink/70">{card.meaningEn}</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button type="button" className="teacher-btn-secondary" onClick={() => grade("again")}>
                      Again
                    </button>
                    <button type="button" className="teacher-btn-primary" onClick={() => grade("know")}>
                      Know
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="teacher-btn-primary mt-6 w-full"
                  onClick={() => setRevealed(true)}
                >
                  Show meaning
                </button>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-ink/55">No cards due right now.</p>
          )}
          <button
            type="button"
            className="mt-4 w-full text-sm text-ink/45 underline"
            onClick={() => {
              setMode("list");
              setRevealed(false);
            }}
          >
            Back to list
          </button>
        </section>
      )}

      <Link href="/sing" className="teacher-btn-secondary mt-8 w-full text-center">
        Open Sing / Lyrics
      </Link>
      <Link href="/scan" className="teacher-btn-secondary mt-3 w-full text-center">
        Scan & Read
      </Link>
      <Link href="/" className="teacher-btn-secondary mt-3 w-full text-center">
        Home
      </Link>
    </div>
  );
}
