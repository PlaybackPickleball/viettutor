"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ReadingPracticeMic } from "@/components/ReadingPracticeMic";
import { WordLearningCard } from "@/components/WordLearningCard";
import { speakVietnamese } from "@/lib/audio";
import {
  segmentVietnamese,
  sentenceTranslationHint,
} from "@/lib/services/segmentationService";
import { explainExpression } from "@/lib/services/tutorService";
import {
  loadActiveLesson,
  loadVocab,
  saveVocabItem,
  type ReadingLessonDraft,
} from "@/lib/vocab/store";

export function ReadClient() {
  const router = useRouter();
  const [lesson, setLesson] = useState<ReadingLessonDraft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showPractice, setShowPractice] = useState(false);

  useEffect(() => {
    const active = loadActiveLesson();
    if (!active?.correctedText) {
      router.replace("/scan");
      return;
    }
    setLesson(active);
    const vocab = loadVocab();
    setSavedIds(new Set(vocab.map((v) => v.expression.toLowerCase())));
  }, [router]);

  const segments = useMemo(
    () => (lesson ? segmentVietnamese(lesson.correctedText) : []),
    [lesson],
  );

  const selected = segments.find((s) => s.id === selectedId) ?? null;
  const explanation = selected
    ? explainExpression(selected.expression, lesson?.correctedText)
    : null;

  const translation = lesson ? sentenceTranslationHint(lesson.correctedText) : null;

  async function readAll() {
    if (!lesson) return;
    try {
      await speakVietnamese(lesson.correctedText);
    } catch {
      /* */
    }
  }

  function saveWord() {
    if (!selected || !explanation || !lesson) return;
    saveVocabItem({
      expression: explanation.expression,
      meaningEn: explanation.meaningEn,
      originalSentence: lesson.correctedText,
      sourceLessonId: lesson.id,
    });
    setSavedIds((prev) => new Set(prev).add(explanation.expression.toLowerCase()));
  }

  if (!lesson) {
    return (
      <div className="studio-shell">
        <p className="text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Link href="/vocab" className="text-sm text-coral underline-offset-2 hover:underline">
          Saved words
        </Link>
      </div>

      <p className="quiet-label mt-6">Interactive reading</p>
      <h1 className="mt-1 font-display text-2xl text-ink">Tap a word to learn</h1>

      {translation ? (
        <p className="mt-2 text-ink/55 italic">{translation}</p>
      ) : (
        <p className="mt-2 text-sm text-ink/45">
          Full-sentence translation available for known demo patterns; tap words for meanings.
        </p>
      )}

      <div className="ami-card mt-5 px-3 py-4">
        <div className="flex flex-wrap gap-2" lang="vi">
          {segments.map((seg) => {
            if (seg.kind === "punct") {
              return (
                <span key={seg.id} className="px-0.5 text-xl text-ink/70">
                  {seg.text}
                </span>
              );
            }
            const active = seg.id === selectedId;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => {
                  setSelectedId(seg.id);
                  setShowPractice(false);
                }}
                className={`rounded-xl px-3 py-2 text-lg transition ${
                  active
                    ? "bg-ink text-paper ring-2 ring-coral"
                    : "bg-soft text-ink hover:bg-paper"
                }`}
              >
                {seg.text}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={readAll}>
          Read entire sentence
        </button>
        <button
          type="button"
          className="teacher-btn-secondary py-2 text-sm"
          onClick={() => setShowPractice(true)}
        >
          Practice pronunciation
        </button>
        <Link href="/scan/review" className="teacher-btn-secondary py-2 text-sm">
          Edit text
        </Link>
      </div>

      {explanation ? (
        <div className="mt-5">
          <WordLearningCard
            explanation={explanation}
            onSave={saveWord}
            saved={savedIds.has(explanation.expression.toLowerCase())}
            onPractice={() => setShowPractice(true)}
          />
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink/50">Select a word to see its meaning.</p>
      )}

      {showPractice ? (
        <div className="mt-5">
          <ReadingPracticeMic
            expectedText={selected?.expression || lesson.correctedText}
            lessonId={lesson.id}
          />
        </div>
      ) : null}

      <Link href="/scan" className="teacher-btn-secondary mt-8 w-full text-center">
        Scan another
      </Link>
      <Link href="/" className="mt-3 text-center text-sm text-ink/45">
        Home
      </Link>
    </div>
  );
}
