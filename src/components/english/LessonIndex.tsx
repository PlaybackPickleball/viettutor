"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserStore } from "@/lib/experience/store";
import { ENGLISH_LESSONS } from "@/lib/english/curriculum";
import { loadEnglishProgress } from "@/lib/english/progress";
import { EnShell } from "./EnShell";

export function LessonIndex() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const progress = loadEnglishProgress(browserStore());
    const marks: Record<string, boolean> = {};
    for (const lesson of ENGLISH_LESSONS) marks[lesson.id] = Boolean(progress.lessons[lesson.id]?.completed);
    setDone(marks);
  }, []);

  return (
    <EnShell title="Tất cả các bài">
      <p className="text-lg">Bạn mở được mọi bài, kể cả bài trước. Không có bài bị khóa.</p>
      <ol className="mt-5 space-y-3">
        {ENGLISH_LESSONS.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/en/lesson/${lesson.id}`}
              className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-[#1b2a4a] px-4 py-3"
            >
              <span>
                <span className="block text-sm">Ngày {lesson.day}</span>
                <span className="text-lg font-semibold">{lesson.titleVi}</span>
              </span>
              <span>{done[lesson.id] ? "Xong" : "Mở"}</span>
            </Link>
          </li>
        ))}
      </ol>
    </EnShell>
  );
}
