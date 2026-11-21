"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ListenControls } from "@/components/ListenControls";
import {
  getSkill,
  loadPathProgress,
  recordExerciseResult,
  skillsDueForReview,
  type PathProgressState,
} from "@/lib/phonics/learningPath";
import {
  dueVocab,
  gradeVocabItem,
  isSongVocab,
  loadVocab,
  type SavedVocabItem,
} from "@/lib/vocab/store";

type QueueItem =
  | { kind: "skill"; id: string; labelEn: string; labelVi: string; listenText: string }
  | { kind: "vocab"; item: SavedVocabItem };

function skillListenText(skillId: string, labelVi: string): string {
  if (skillId === "letter-a") return "a";
  if (skillId === "letter-b") return "bờ";
  if (skillId === "letter-o") return "o";
  if (skillId === "vocab-bo") return "bò";
  if (skillId === "vocab-ba-ma") return "ba";
  if (skillId.startsWith("tone-")) return labelVi;
  return labelVi || skillId;
}

export function DailyReviewClient() {
  const [progress, setProgress] = useState<PathProgressState | null>(null);
  const [vocab, setVocab] = useState<SavedVocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [doneNote, setDoneNote] = useState<string | null>(null);

  function refresh() {
    setProgress(loadPathProgress());
    setVocab(loadVocab());
  }

  useEffect(() => {
    refresh();
  }, []);

  const queue = useMemo(() => {
    if (!progress) return [] as QueueItem[];
    const skillIds = skillsDueForReview(progress, 6);
    const skills: QueueItem[] = skillIds.map((id) => {
      const skill = getSkill(id);
      const labelEn = skill?.labelEn ?? id;
      const labelVi = skill?.labelVi ?? id;
      return {
        kind: "skill",
        id,
        labelEn,
        labelVi,
        listenText: skillListenText(id, labelVi),
      };
    });
    const words: QueueItem[] = dueVocab(vocab)
      .filter(isSongVocab)
      .slice(0, 6)
      .map((item) => ({ kind: "vocab", item }));
    return [...skills, ...words];
  }, [progress, vocab]);

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading review…</p>
      </div>
    );
  }

  const current = queue[index];

  function advance() {
    setRevealed(false);
    setDoneNote(null);
    if (index + 1 >= queue.length) {
      setIndex(queue.length);
      return;
    }
    setIndex((i) => i + 1);
  }

  function rememberSkill(ok: boolean) {
    if (!current || current.kind !== "skill") return;
    setProgress(recordExerciseResult(loadPathProgress(), [current.id], ok));
    setDoneNote(ok ? "Marked remembered — spaced schedule updated." : "Marked again — due sooner.");
    window.setTimeout(advance, 500);
  }

  function gradeWord(grade: "know" | "again") {
    if (!current || current.kind !== "vocab") return;
    const next = gradeVocabItem(current.item.id, grade);
    setVocab(next);
    setDoneNote(grade === "know" ? "Nice — longer interval." : "Again tomorrow.");
    window.setTimeout(advance, 500);
  }

  if (!queue.length || index >= queue.length) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <p className="quiet-label mt-6">Daily Review</p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          {queue.length === 0 ? "Nothing due" : "Review complete"}
        </h1>
        <p className="mt-2 text-ink/60">
          {queue.length === 0
            ? "Practice a Foundations lesson or tap a karaoke word to fill this queue."
            : "Self-graded only — no invented pronunciation scores."}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/danh-van" className="teacher-btn-primary w-full text-center">
            Back to Đánh Vần
          </Link>
          <Link href="/vocab" className="teacher-btn-secondary w-full text-center">
            Open word deck
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Daily Review</p>
          <h1 className="mt-1 font-display text-2xl text-ink">Sounds & words</h1>
          <p className="text-sm text-ink/50">
            {index + 1} / {queue.length} · self-check only
          </p>
        </div>
        <Link href="/danh-van" className="teacher-btn-secondary px-4 py-2 text-sm">
          Map
        </Link>
      </header>

      <div className="ami-card space-y-4 px-4 py-5">
        {current.kind === "skill" ? (
          <>
            <p className="quiet-label">Path skill</p>
            <p className="font-hand text-5xl text-ink" lang="vi">
              {current.labelVi}
            </p>
            <p className="text-sm text-ink/55">{current.labelEn}</p>
            <ListenControls text={current.listenText} />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                className="teacher-btn-secondary"
                onClick={() => rememberSkill(false)}
              >
                Again
              </button>
              <button
                type="button"
                className="teacher-btn-primary"
                onClick={() => rememberSkill(true)}
              >
                I remember
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="quiet-label">Song / karaoke word</p>
            <p className="font-hand text-5xl text-ink" lang="vi">
              {current.item.expression}
            </p>
            <ListenControls text={current.item.expression} />
            {!revealed ? (
              <button
                type="button"
                className="teacher-btn-secondary w-full"
                onClick={() => setRevealed(true)}
              >
                Reveal meaning
              </button>
            ) : (
              <p className="text-sm text-ink/70" lang="en">
                {current.item.meaningEn}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                className="teacher-btn-secondary"
                onClick={() => gradeWord("again")}
              >
                Again
              </button>
              <button
                type="button"
                className="teacher-btn-primary"
                onClick={() => gradeWord("know")}
              >
                Know
              </button>
            </div>
          </>
        )}
        {doneNote ? <p className="text-sm text-ink/60">{doneNote}</p> : null}
      </div>

      <p className="mt-4 text-xs text-ink/45">
        Pulls due Đánh Vần skills and karaoke/song words saved for review. No automatic scores.
      </p>
    </div>
  );
}
