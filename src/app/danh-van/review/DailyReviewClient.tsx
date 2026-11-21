"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ListenControls } from "@/components/ListenControls";
import { SpeakCompareAssess } from "@/components/phonics/path/SpeakCompareAssess";
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
import {
  duePackWordIds,
  getPackWord,
  gradePackWord,
  loadPackProgress,
  packImageUrl,
  type PackWord,
} from "@/lib/vocabulary";

type QueueItem =
  | { kind: "skill"; id: string; labelEn: string; labelVi: string; listenText: string }
  | { kind: "vocab"; item: SavedVocabItem }
  | { kind: "pack"; word: PackWord };

function skillListenText(skillId: string, labelVi: string): string {
  if (skillId === "letter-a") return "a";
  if (skillId === "letter-b") return "bờ";
  if (skillId === "letter-o") return "o";
  if (skillId === "vocab-bo") return "bò";
  if (skillId === "vocab-ba-ma") return "ba";
  if (skillId.startsWith("tone-")) return labelVi;
  if (skillId.startsWith("pack-v-")) {
    const id = skillId.replace("pack-v-", "v");
    return getPackWord(id)?.vi ?? labelVi;
  }
  return labelVi || skillId;
}

/** Prefer a short written form for write/say practice (not teaching-sound spellings). */
function practiceWritten(item: QueueItem): string {
  if (item.kind === "vocab") return item.item.expression;
  if (item.kind === "pack") return item.word.vi;
  if (item.id === "letter-a") return "a";
  if (item.id === "letter-b") return "b";
  if (item.id === "letter-o") return "o";
  if (item.id === "vocab-bo") return "bò";
  if (item.id === "vocab-ba-ma") return "ba";
  return item.listenText;
}

export function DailyReviewClient() {
  const [progress, setProgress] = useState<PathProgressState | null>(null);
  const [vocab, setVocab] = useState<SavedVocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [doneNote, setDoneNote] = useState<string | null>(null);
  const [said, setSaid] = useState(false);

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
      .slice(0, 4)
      .map((item) => ({ kind: "vocab", item }));
    const packDue: QueueItem[] = duePackWordIds(loadPackProgress())
      .slice(0, 4)
      .map((id) => getPackWord(id))
      .filter((w): w is NonNullable<typeof w> => Boolean(w))
      .map((word) => ({ kind: "pack", word }));
    return [...skills, ...packDue, ...words];
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
    setSaid(false);
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
    if (!current) return;
    if (current.kind === "vocab") {
      const next = gradeVocabItem(current.item.id, grade);
      setVocab(next);
    } else if (current.kind === "pack") {
      gradePackWord(current.word.id, grade);
      setProgress(loadPathProgress());
    } else {
      return;
    }
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
          <Link href="/hear-write" className="teacher-btn-secondary w-full text-center">
            Hear & Write drills
          </Link>
          <Link href="/vocab" className="teacher-btn-secondary w-full text-center">
            Open word deck
          </Link>
        </div>
      </div>
    );
  }

  const written = practiceWritten(current);
  const writeHref = `/hear-write?written=${encodeURIComponent(written)}`;

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Daily Review</p>
          <h1 className="mt-1 font-display text-2xl text-ink">Hear → Write → Say → Review</h1>
          <p className="text-sm text-ink/50">
            {index + 1} / {queue.length} · spaced revisit
          </p>
        </div>
        <Link href="/danh-van" className="teacher-btn-secondary px-4 py-2 text-sm">
          Map
        </Link>
      </header>

      <div className="ami-card space-y-5 px-4 py-5">
        {current.kind === "skill" ? (
          <>
            <div>
              <p className="quiet-label">1 · Hear</p>
              <p className="mt-1 font-hand text-5xl text-ink" lang="vi">
                {current.labelVi}
              </p>
              <p className="text-sm text-ink/55">{current.labelEn}</p>
              <div className="mt-3">
                <ListenControls text={current.listenText} />
              </div>
            </div>

            <div>
              <p className="quiet-label">2 · Write</p>
              <Link href={writeHref} className="teacher-btn-secondary mt-2 inline-flex text-sm">
                Hear & Write “{written}”
              </Link>
            </div>

            <div>
              <p className="quiet-label mb-2">3 · Say</p>
              <SpeakCompareAssess
                expectedText={written}
                itemId={`review-${current.id}`}
                onPracticed={() => setSaid(true)}
              />
              {said ? (
                <p className="mt-2 text-xs text-ink/45">Practice saved — match is not a score.</p>
              ) : null}
            </div>

            <div>
              <p className="quiet-label mb-2">4 · Review</p>
              <div className="grid grid-cols-2 gap-2">
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
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="quiet-label">1 · Hear</p>
              <p className="mt-1 font-hand text-5xl text-ink" lang="vi">
                {current.kind === "pack" ? current.word.vi : current.item.expression}
              </p>
              {current.kind === "pack" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={packImageUrl(current.word)}
                  alt=""
                  width={1254}
                  height={1254}
                  loading="lazy"
                  className="mx-auto mt-3 h-28 w-28 rounded-xl bg-paper object-contain object-center sm:h-32 sm:w-32"
                />
              ) : null}
              <div className="mt-3">
                <ListenControls
                  text={current.kind === "pack" ? current.word.vi : current.item.expression}
                />
              </div>
            </div>

            <div>
              <p className="quiet-label">2 · Write</p>
              <Link href={writeHref} className="teacher-btn-secondary mt-2 inline-flex text-sm">
                Hear & Write “{written}”
              </Link>
            </div>

            <div>
              <p className="quiet-label mb-2">3 · Say</p>
              <SpeakCompareAssess
                expectedText={written}
                itemId={
                  current.kind === "pack"
                    ? `review-pack-${current.word.id}`
                    : `review-vocab-${current.item.id}`
                }
                onPracticed={() => setSaid(true)}
              />
            </div>

            <div>
              <p className="quiet-label mb-2">4 · Review</p>
              {!revealed ? (
                <button
                  type="button"
                  className="teacher-btn-secondary mb-3 w-full"
                  onClick={() => setRevealed(true)}
                >
                  Reveal meaning
                </button>
              ) : (
                <p className="mb-3 text-sm text-ink/70" lang="en">
                  {current.kind === "pack" ? current.word.en : current.item.meaningEn}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
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
            </div>
          </>
        )}
        {doneNote ? <p className="text-sm text-ink/60">{doneNote}</p> : null}
      </div>

      <p className="mt-4 text-xs text-ink/45">
        Spaced skills + First 100 pack + song words. Deepgram match is transcription only — never a
        pronunciation %.
      </p>
    </div>
  );
}
