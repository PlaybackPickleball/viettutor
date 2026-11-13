"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { DEMO_READING_TEXT } from "@/lib/services/ocrService";
import { loadActiveLesson, saveReadingLesson, type ReadingLessonDraft } from "@/lib/vocab/store";

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

export function ReviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<ReadingLessonDraft | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const wantDemo = searchParams.get("demo") === "1";
    let active = loadActiveLesson();
    if (wantDemo) {
      active = seedDemoLesson();
      // Drop ?demo=1 so refresh / back doesn't keep re-seeding over a real scan
      router.replace("/scan/review");
    }
    if (!active) {
      router.replace("/scan");
      return;
    }
    setLesson(active);
    setText(active.correctedText);
  }, [router, searchParams]);

  function continueReading() {
    if (!lesson) return;
    const next = { ...lesson, correctedText: text.trim() || lesson.rawOcr };
    saveReadingLesson(next);
    router.push("/scan/read");
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
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl text-ink">Fix the text</h1>
      <p className="mt-2 text-ink/60">
        Correct OCR mistakes and missing tone marks. This edited text becomes your trusted lesson —
        we won’t invent words.
      </p>

      <label className="quiet-label mt-6 block" htmlFor="ocr-text">
        Recognized Vietnamese
      </label>
      <textarea
        id="ocr-text"
        className="ami-card mt-2 min-h-40 w-full resize-y px-4 py-3 font-sans text-lg leading-relaxed text-ink outline-none focus:ring-2 focus:ring-coral/40"
        lang="vi"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <p className="mt-2 text-xs text-ink/40">
        Provider: {lesson.provider}
        {lesson.imageName ? ` · ${lesson.imageName}` : ""}
        {lesson.translation ? " · translation ready" : ""}
        {lesson.aiSegments?.length ? ` · ${lesson.aiSegments.length} AI words` : ""}
      </p>
      {lesson.translation ? (
        <div className="ami-card mt-4 px-4 py-3">
          <p className="quiet-label">English subtitle</p>
          <p className="mt-1 text-lg text-ink/65">{lesson.translation}</p>
        </div>
      ) : null}

      <button type="button" className="teacher-btn-primary mt-6 w-full" onClick={continueReading}>
        Continue — tap words to hear
      </button>
      <Link href="/scan" className="teacher-btn-secondary mt-3 w-full text-center">
        Scan again
      </Link>
    </div>
  );
}
