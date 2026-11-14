"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ReadingPracticeMic } from "@/components/ReadingPracticeMic";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import { analyzeTextWithAi } from "@/lib/services/analyzeClient";
import { DEMO_READING_TEXT } from "@/lib/services/ocrService";
import {
  segmentVietnamese,
  sentenceTranslationHint,
} from "@/lib/services/segmentationService";
import { explainExpression } from "@/lib/services/tutorService";
import type { TextSegment, TutorExplanation } from "@/lib/services/types";
import {
  loadActiveLesson,
  loadVocab,
  saveReadingLesson,
  saveVocabItem,
  type ReadingLessonDraft,
} from "@/lib/vocab/store";

function seedDemoLesson(): ReadingLessonDraft {
  const lesson: ReadingLessonDraft = {
    id: `lesson-demo-${Date.now()}`,
    imageName: "demo",
    rawOcr: DEMO_READING_TEXT,
    correctedText: DEMO_READING_TEXT,
    createdAt: new Date().toISOString(),
    provider: "demo",
    translation: "I want to drink coconut water.",
    aiSegments: [
      { text: "Tôi", meaningEn: "I" },
      { text: "muốn", meaningEn: "want" },
      { text: "uống", meaningEn: "drink" },
      { text: "nước dừa", meaningEn: "coconut water", note: "Southern everyday drink order" },
    ],
  };
  saveReadingLesson(lesson);
  return lesson;
}

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
    if (idx > cursor) {
      const gap = text.slice(cursor, idx);
      for (const g of segmentVietnamese(gap)) {
        out.push({ ...g, id: `gap-${id++}` });
      }
    }
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

  if (cursor < text.length) {
    for (const g of segmentVietnamese(text.slice(cursor))) {
      out.push({ ...g, id: `tail-${id++}` });
    }
  }

  return out.length ? out : segmentVietnamese(text);
}

export function ReadClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<ReadingLessonDraft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showPractice, setShowPractice] = useState(false);
  const [explanation, setExplanation] = useState<TutorExplanation | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [sentenceTranslation, setSentenceTranslation] = useState<string | null>(null);
  const [translationBusy, setTranslationBusy] = useState(false);
  const lessonBooted = useRef(false);

  useEffect(() => {
    const wantDemo = searchParams.get("demo") === "1";
    // Seed demo once, then drop ?demo=1 without re-booting the lesson on every param change
    if (!lessonBooted.current) {
      let active = loadActiveLesson();
      if (wantDemo) {
        active = seedDemoLesson();
      }
      if (!active?.correctedText) {
        router.replace("/scan");
        return;
      }
      lessonBooted.current = true;
      setLesson(active);
      const vocab = loadVocab();
      setSavedIds(new Set(vocab.map((v) => v.expression.toLowerCase())));

      const localHint =
        active.translation || sentenceTranslationHint(active.correctedText) || null;
      setSentenceTranslation(localHint);
      setTranslationBusy(!localHint);
      void (async () => {
        const ai = await analyzeTextWithAi({
          sentence: active!.correctedText,
          wantSentenceTranslation: true,
        });
        setTranslationBusy(false);
        if (ai?.sentenceTranslation) {
          setSentenceTranslation(ai.sentenceTranslation);
        }
      })();
    }
    if (wantDemo) {
      router.replace("/scan/read");
    }
    return () => stopSpeaking();
  }, [router, searchParams]);

  const segments = useMemo(
    () =>
      lesson ? segmentsFromAi(lesson.correctedText, lesson.aiSegments ?? []) : [],
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

  function meaningFor(expression: string, active: ReadingLessonDraft): TutorExplanation {
    const cached = meaningMap.get(expression.toLowerCase());
    const local = explainExpression(expression, active.correctedText);
    if (cached) {
      return {
        expression,
        meaningEn: cached.meaningEn,
        note: cached.note || local.note,
        toneHint: local.toneHint,
        inContext: local.inContext,
        source: "llm",
      };
    }
    return local;
  }

  async function speakWord(seg: TextSegment) {
    setSpeakingId(seg.id);
    try {
      await speakVietnamese(seg.expression);
    } catch {
      /* TTS optional on some browsers */
    } finally {
      setSpeakingId((id) => (id === seg.id ? null : id));
    }
  }

  function onTapWord(seg: TextSegment) {
    if (!lesson) return;
    // Update selection + meaning synchronously so the panel appears on the same tap
    setSelectedId(seg.id);
    setShowPractice(false);
    setExplanation(meaningFor(seg.expression, lesson));
    void speakWord(seg);
  }

  async function readAll() {
    if (!lesson) return;
    setSpeakingId("all");
    try {
      await speakVietnamese(lesson.correctedText);
    } catch {
      /* */
    } finally {
      setSpeakingId(null);
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

      <p className="quiet-label mt-6">Scan reading</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Tap a word to hear it</h1>
      <p className="mt-2 text-ink/55">English sits under the Vietnamese as a subtitle.</p>

      {/* Main reading stage */}
      <section className="ami-card mt-6 px-4 py-6">
        <div className="flex flex-wrap items-center gap-2" lang="vi">
          {segments.map((seg) => {
            if (seg.kind === "punct") {
              return (
                <span key={seg.id} className="px-0.5 text-2xl leading-snug text-ink/65">
                  {seg.text}
                </span>
              );
            }
            const active = seg.id === selectedId;
            const speaking = speakingId === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                data-word-chip={seg.expression}
                onClick={() => onTapWord(seg)}
                aria-pressed={active}
                aria-label={`Hear ${seg.text}`}
                className={`relative z-10 cursor-pointer rounded-2xl px-3.5 py-2.5 text-2xl font-medium leading-snug transition active:scale-[0.97] ${
                  active
                    ? "bg-coral text-paper shadow-soft ring-2 ring-coral/40"
                    : speaking
                      ? "bg-amber/90 text-paper"
                      : "bg-soft text-ink hover:bg-paper"
                }`}
              >
                {seg.text}
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[#e8d9c8] pt-4">
          <p className="quiet-label">English subtitle</p>
          {sentenceTranslation ? (
            <p className="mt-2 text-xl leading-relaxed text-ink/70">{sentenceTranslation}</p>
          ) : (
            <p className="mt-2 text-base text-ink/40">
              {translationBusy ? "Translating…" : "Translation will appear here when ready."}
            </p>
          )}
        </div>

        <button
          type="button"
          className="teacher-btn-primary mt-5 w-full"
          onClick={() => void readAll()}
          disabled={speakingId === "all"}
        >
          {speakingId === "all" ? "Reading…" : "Hear full sentence"}
        </button>
      </section>

      {/* Word detail — show as soon as a chip is selected */}
      {selected ? (
        <section
          className="ami-card mt-4 animate-pop px-4 py-5"
          data-selected-word={selected.expression}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="quiet-label">Selected word</p>
              <p className="mt-1 font-display text-4xl text-ink" lang="vi">
                {explanation?.expression ?? selected.expression}
              </p>
              <p className="mt-2 text-xl text-ink/65">
                {explanation?.meaningEn ??
                  meaningMap.get(selected.expression.toLowerCase())?.meaningEn ??
                  "…"}
              </p>
            </div>
            <button
              type="button"
              className="circle-btn-primary shrink-0"
              onClick={() => void speakWord(selected)}
              aria-label="Hear word again"
            >
              <SpeakerIcon />
            </button>
          </div>

          {explanation?.note ? (
            <p className="mt-3 text-sm leading-relaxed text-ink/60">{explanation.note}</p>
          ) : null}
          {aiBusy ? <p className="mt-2 text-xs text-ink/40">Updating meaning…</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="teacher-btn-secondary py-2 text-sm"
              onClick={() =>
                void speakVietnamese(explanation?.expression ?? selected.expression, {
                  slow: true,
                })
              }
            >
              Hear slow
            </button>
            <button
              type="button"
              className="teacher-btn-secondary py-2 text-sm"
              onClick={() => setShowPractice((v) => !v)}
            >
              {showPractice ? "Hide practice" : "Practice saying it"}
            </button>
            <button type="button" className="teacher-btn-amber py-2 text-sm" onClick={saveWord}>
              {savedIds.has(
                (explanation?.expression ?? selected.expression).toLowerCase(),
              )
                ? "Saved ✓"
                : "Save word"}
            </button>
          </div>
        </section>
      ) : (
        <p className="mt-5 text-center text-sm text-ink/45">
          Tap any Vietnamese word above — it will play out loud.
        </p>
      )}

      {showPractice && selected ? (
        <div className="mt-4">
          <ReadingPracticeMic
            expectedText={selected.expression}
            lessonId={lesson.id}
          />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-3">
        <Link href="/scan/review" className="teacher-btn-secondary text-center text-sm">
          Edit text
        </Link>
        <Link href="/scan" className="teacher-btn-secondary text-center text-sm">
          Scan another
        </Link>
      </div>
      <Link href="/" className="mt-3 text-center text-sm text-ink/45">
        Home
      </Link>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10v4h3l5 4V6L7 10H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
