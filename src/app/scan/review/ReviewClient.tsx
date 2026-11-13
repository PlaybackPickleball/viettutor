"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { loadActiveLesson, saveReadingLesson, type ReadingLessonDraft } from "@/lib/vocab/store";

export function ReviewClient() {
  const router = useRouter();
  const [lesson, setLesson] = useState<ReadingLessonDraft | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const active = loadActiveLesson();
    if (!active) {
      router.replace("/scan");
      return;
    }
    setLesson(active);
    setText(active.correctedText);
  }, [router]);

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
      </p>

      <button type="button" className="teacher-btn-primary mt-6 w-full" onClick={continueReading}>
        Start reading lesson
      </button>
      <Link href="/scan" className="teacher-btn-secondary mt-3 w-full text-center">
        Scan again
      </Link>
    </div>
  );
}
