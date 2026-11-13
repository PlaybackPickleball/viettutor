"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ReadingPracticeMic } from "@/components/ReadingPracticeMic";
import { WordLearningCard } from "@/components/WordLearningCard";
import { speakVietnamese } from "@/lib/audio";
import { analyzeTextWithAi } from "@/lib/services/analyzeClient";
import {
  segmentVietnamese,
  sentenceTranslationHint,
} from "@/lib/services/segmentationService";
import { explainExpression } from "@/lib/services/tutorService";
import type { TextSegment, TutorExplanation } from "@/lib/services/types";
import {
  loadActiveLesson,
  loadVocab,
  saveVocabItem,
  type ReadingLessonDraft,
} from "@/lib/vocab/store";

function segmentsFromAi(
  text: string,
  aiSegments: { text: string; meaningEn: string; note?: string }[],
): TextSegment[] {
  if (!aiSegments.length) return segmentVietnamese(text);
  const out: TextSegment[] = [];
  let cursor = 0;
  let id = 0;
  const lower = text.toLowerCase();

  for (const seg of aiSegments) {
    const needle = seg.text.trim();
    if (!needle) continue;
    const idx = lower.indexOf(needle.toLowerCase(), cursor);
    if (idx === -1) continue;
    // Skip gaps as plain syllables via lexicon segmenter later if needed
    const slice = text.slice(idx, idx + needle.length);
    out.push({
      id: `ai-${id++}`,
      text: slice,
      kind: needle.includes(" ") ? "word" : "syllable",
      expression: slice,
      start: idx,
      end: idx + needle.length,
    });
    cursor = idx + needle.length;
  }

  return out.length ? out : segmentVietnamese(text);
}

export function ReadClient() {
  const router = useRouter();
  const [lesson, setLesson] = useState<ReadingLessonDraft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showPractice, setShowPractice] = useState(false);
  const [explanation, setExplanation] = useState<TutorExplanation | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [sentenceTranslation, setSentenceTranslation] = useState<string | null>(null);

  useEffect(() => {
    const active = loadActiveLesson();
    if (!active?.correctedText) {
      router.replace("/scan");
      return;
    }
    setLesson(active);
    const vocab = loadVocab();
    setSavedIds(new Set(vocab.map((v) => v.expression.toLowerCase())));

    const localHint =
      active.translation || sentenceTranslationHint(active.correctedText) || null;
    setSentenceTranslation(localHint);

    // Enrich full-sentence translation via AI when signed in
    void (async () => {
      const ai = await analyzeTextWithAi({
        sentence: active.correctedText,
        wantSentenceTranslation: true,
      });
      if (ai?.sentenceTranslation) {
        setSentenceTranslation(ai.sentenceTranslation);
      }
    })();
  }, [router]);

  const segments = useMemo(
    () =>
      lesson
        ? segmentsFromAi(lesson.correctedText, lesson.aiSegments ?? [])
        : [],
    [lesson],
  );

  const meaningMap = useMemo(() => {
    const map = new Map<string, { meaningEn: string; note?: string }>();
    for (const s of lesson?.aiSegments ?? []) {
      map.set(s.text.toLowerCase(), { meaningEn: s.meaningEn, note: s.note });
    }
    return map;
  }, [lesson]);

  const selected = segments.find((s) => s.id === selectedId) ?? null;
  const selectedExpression = selected?.expression ?? null;

  useEffect(() => {
    if (!selectedExpression || !lesson) {
      setExplanation(null);
      return;
    }

    const cached = meaningMap.get(selectedExpression.toLowerCase());
    const local = explainExpression(selectedExpression, lesson.correctedText);
    if (cached) {
      setExplanation({
        expression: selectedExpression,
        meaningEn: cached.meaningEn,
        note: cached.note || local.note,
        toneHint: local.toneHint,
        inContext: local.inContext,
        source: "llm",
      });
    } else {
      setExplanation(local);
    }

    let cancelled = false;
    setAiBusy(true);
    void (async () => {
      const ai = await analyzeTextWithAi({
        expression: selectedExpression,
        sentence: lesson.correctedText,
      });
      if (cancelled) return;
      setAiBusy(false);
      if (ai?.expression?.meaningEn && ai.expression.source !== "fallback") {
        setExplanation(ai.expression);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedExpression, lesson, meaningMap]);

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

      {sentenceTranslation ? (
        <p className="mt-2 text-ink/55 italic">{sentenceTranslation}</p>
      ) : (
        <p className="mt-2 text-sm text-ink/45">
          Tap words for meanings. AI fills sentence translation when available.
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
          {aiBusy ? (
            <p className="mt-2 text-xs text-ink/40">Refreshing meaning with AI…</p>
          ) : null}
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
