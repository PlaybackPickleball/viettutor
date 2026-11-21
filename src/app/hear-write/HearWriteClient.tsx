"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { LetterTraceCanvas } from "@/components/LetterTraceCanvas";
import { ListenControls } from "@/components/ListenControls";
import {
  HEAR_WRITE_LEVELS,
  answersMatch,
  getHearWriteLevel,
  itemsForLevel,
  levelMasteryCounts,
  loadHearWriteProgress,
  recordHearWriteAttempt,
  type HearWriteItem,
  type HearWriteLevelId,
  type HearWriteProgressState,
} from "@/lib/hearWrite";
import { getLetter } from "@/lib/letters";

export function HearWriteClient({
  initialLevel,
  initialWritten,
}: {
  initialLevel?: HearWriteLevelId;
  initialWritten?: string;
} = {}) {
  const [progress, setProgress] = useState<HearWriteProgressState | null>(null);
  const [level, setLevel] = useState<HearWriteLevelId>(initialLevel ?? 1);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [heard, setHeard] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showPad, setShowPad] = useState(false);

  useEffect(() => {
    const p = loadHearWriteProgress();
    setProgress(p);
    const startLevel = initialLevel ?? p.unlockedLevel;
    setLevel(startLevel);
  }, [initialLevel]);

  const pool = useMemo(() => itemsForLevel(level), [level]);

  useEffect(() => {
    if (!pool.length) return;
    if (initialWritten) {
      const i = pool.findIndex((x) => x.written === initialWritten.normalize("NFC"));
      if (i >= 0) setIndex(i);
    } else {
      setIndex(0);
    }
    setTyped("");
    setHeard(false);
    setFeedback(null);
    setRevealed(false);
    setShowPad(false);
  }, [level, pool, initialWritten]);

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading…</p>
      </div>
    );
  }

  const item: HearWriteItem | undefined = pool[index];
  const counts = levelMasteryCounts(progress, level);
  const levelMeta = getHearWriteLevel(level);
  const letterStrokes =
    item && graphemeIsSingleLetter(item.written)
      ? getLetter(letterIdForGrapheme(item.written))?.strokes
      : undefined;

  function check() {
    if (!item || !progress) return;
    const ok = answersMatch(item.written, typed);
    const next = recordHearWriteAttempt(progress, item.id, ok);
    setProgress(next);
    if (ok) {
      setFeedback("Correct — stamped.");
      setRevealed(true);
    } else {
      setFeedback("Not quite — listen again, then try once more.");
      setRevealed(false);
    }
  }

  function nextItem() {
    setTyped("");
    setHeard(false);
    setFeedback(null);
    setRevealed(false);
    setShowPad(false);
    if (index + 1 >= pool.length) {
      setIndex(0);
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Write · Hear first</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Hear & Write</h1>
          <p className="mt-1 text-sm text-ink/55">
            Listen, then write the sound — levels grow from 1 letter to long rimes.
          </p>
        </div>
        <Link href="/" className="teacher-btn-secondary px-4 py-2 text-sm">
          Home
        </Link>
      </header>

      <section className="ami-card px-4 py-4">
        <p className="quiet-label">Level</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HEAR_WRITE_LEVELS.map((l) => {
            const locked = l.id > progress.unlockedLevel;
            const active = l.id === level;
            return (
              <button
                key={l.id}
                type="button"
                disabled={locked}
                onClick={() => setLevel(l.id)}
                className={`rounded-2xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-coral/15 font-medium text-ink ring-2 ring-coral"
                    : locked
                      ? "bg-ink/5 text-ink/35"
                      : "bg-soft text-ink/70 hover:ring-1 hover:ring-coral/30"
                }`}
              >
                {l.titleEn}
                {locked ? " · lock" : ""}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink/50">
          {levelMeta.summaryEn} · {counts.mastered}/{counts.total} mastered
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{
              width: `${counts.total ? Math.round((counts.mastered / counts.total) * 100) : 0}%`,
            }}
          />
        </div>
      </section>

      {item ? (
        <section className="ami-card mt-5 space-y-4 px-4 py-5">
          <div className="flex items-center justify-between gap-2 text-xs text-ink/45">
            <span>
              {index + 1} / {pool.length}
              {progress.items[item.id]?.mastered ? " · mastered" : ""}
            </span>
            <span className="text-ink/35">{item.source.replace("notebook-", "nb ")}</span>
          </div>

          <p className="font-display text-xl text-ink">Hear the sound, then write it</p>
          <p className="text-sm text-ink/50">
            No letter preview until you check — train memory, not copying.
          </p>

          <ListenControls text={item.listenText} onListened={() => setHeard(true)} />

          <label className="block">
            <span className="quiet-label">Your writing</span>
            <input
              type="text"
              inputMode="text"
              lang="vi"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={typed}
              disabled={!heard && !revealed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") check();
              }}
              placeholder={heard ? "Type what you heard…" : "Listen first…"}
              className="mt-2 w-full rounded-2xl border border-[#e8d9c8] bg-paper px-4 py-3 font-hand text-3xl text-ink outline-none ring-coral/40 focus:ring-2"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="teacher-btn-primary flex-1"
              disabled={!heard || !typed.trim()}
              onClick={check}
            >
              Check
            </button>
            <button
              type="button"
              className="teacher-btn-secondary"
              onClick={() => setShowPad((v) => !v)}
            >
              {showPad ? "Hide pad" : "Mali pad"}
            </button>
            {revealed || feedback?.startsWith("Correct") ? (
              <button type="button" className="teacher-btn-secondary flex-1" onClick={nextItem}>
                Next
              </button>
            ) : (
              <button
                type="button"
                className="teacher-btn-secondary text-sm"
                onClick={() => {
                  setRevealed(true);
                  setTyped(item.written);
                }}
              >
                Reveal
              </button>
            )}
          </div>

          {showPad ? (
            <div className="border-t border-[#e8d9c8] pt-4">
              <p className="text-xs text-ink/45">
                Optional Mali practice pad — shape practice only, not graded. Check uses the typed
                answer.
              </p>
              <LetterTraceCanvas
                strokes={letterStrokes ?? []}
                grapheme={revealed ? item.written : "·"}
                praiseMode="unrecognized"
                idleHint="Write freely after listening — we do not score handwriting."
              />
            </div>
          ) : null}

          {feedback ? <p className="text-sm text-ink/70">{feedback}</p> : null}
          {revealed ? (
            <p className="text-center font-hand text-5xl text-coral" lang="vi">
              {item.written}
            </p>
          ) : null}
        </section>
      ) : (
        <p className="mt-6 text-ink/50">No items in this level yet.</p>
      )}

      <p className="mt-6 text-xs text-ink/40">
        Combos from Nicola’s notebook (digraphs + vần). Self-check only — no invented scores.
        Unlock the next length after mastering ~35% of the current level.
      </p>
      <Link href="/danh-van" className="mt-3 inline-block text-sm text-coral underline-offset-2 hover:underline">
        Back to Đánh Vần path
      </Link>
    </div>
  );
}

function graphemeIsSingleLetter(written: string): boolean {
  return [...written.normalize("NFC")].length === 1;
}

function letterIdForGrapheme(g: string): string {
  const map: Record<string, string> = {
    a: "a",
    ă: "a-breve",
    â: "a-circumflex",
    e: "e",
    ê: "e-circumflex",
    i: "i",
    o: "o",
    ô: "o-circumflex",
    ơ: "o-horn",
    u: "u",
    ư: "u-horn",
    b: "b",
    m: "m",
    n: "n",
    t: "t",
    h: "h",
    l: "l",
    c: "c",
    k: "k",
    v: "v",
    g: "g",
    p: "p",
    q: "qu",
    r: "r",
  };
  return map[g] ?? g;
}
