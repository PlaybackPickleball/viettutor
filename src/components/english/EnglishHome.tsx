"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserStore } from "@/lib/experience/store";
import { ENGLISH_LESSONS, lessonCount } from "@/lib/english/curriculum";
import { suggestedLessonIds } from "@/lib/english/onboarding";
import {
  completedCount,
  continueTarget,
  dueReviews,
  greetingVi,
  loadEnglishProgress,
  type EnglishProgress,
} from "@/lib/english/progress";
import { FoundationsMark } from "./FoundationsMark";
import { primaryBtn, secondaryBtn } from "./EnShell";

export function EnglishHome() {
  const [progress, setProgress] = useState<EnglishProgress | null>(null);
  const [hour, setHour] = useState(8);

  useEffect(() => {
    setProgress(loadEnglishProgress(browserStore()));
    setHour(new Date().getHours());
  }, []);

  if (!progress) {
    return (
      <div className="en-ui studio-shell">
        <p>Đang mở lớp học…</p>
      </div>
    );
  }

  const next = continueTarget(progress);
  const done = completedCount(progress);
  const total = lessonCount();
  const today = new Date().toISOString().slice(0, 10);
  const due = dueReviews(progress, today);
  const suggestions = suggestedLessonIds(progress.goals)
    .map((id) => ENGLISH_LESSONS.find((lesson) => lesson.id === id))
    .filter((lesson) => lesson != null);

  return (
    <div className="en-ui studio-shell">
      <header>
        <div className="flex justify-end">
          <Link href="/settings" className={secondaryBtn}>
            Cài đặt
          </Link>
        </div>
        <FoundationsMark compact />
      </header>
      <p className="mt-5 text-base font-semibold text-[var(--en-leaf)]">Học Tiếng Anh</p>
      <h1 className="mt-1 font-display text-4xl text-[var(--en-navy)]">{greetingVi(hour)}</h1>
      <section className="en-panel mt-5 p-4">
        <p className="text-lg">
          Bài đã xong: {done}/{total}
        </p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#1c3a2a]/10" aria-hidden>
          <div className="h-full rounded-full bg-[var(--en-teal)]" style={{ width: `${Math.round((done / total) * 100)}%` }} />
        </div>
        {!progress.onboardingCompleted ? (
          <p className="mt-3 text-base">Bạn có thể làm quen với lớp, hoặc học thử bài chào hỏi ngay.</p>
        ) : null}
        <Link href={`/en/lesson/${next.lessonId}`} className={`${primaryBtn} mt-4 w-full`}>
          Tiếp tục học
        </Link>
      </section>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {!progress.onboardingCompleted ? (
          <Link href="/en/onboarding" className={`${secondaryBtn} col-span-2 w-full`}>
            Làm quen với lớp học
          </Link>
        ) : null}
        <Link href={`/en/lesson/${next.lessonId}`} className={`${secondaryBtn} w-full`}>
          Luyện phát âm
        </Link>
        <Link href="/en/speak" className={`${secondaryBtn} w-full`}>
          Nói với giáo viên
        </Link>
        <Link href="/en/review" className={`${secondaryBtn} w-full`}>
          Ôn từ{due.length ? ` · ${due.length}` : ""}
        </Link>
        <Link href="/en/sing" className={`${secondaryBtn} w-full`}>
          Bài hát
        </Link>
        <Link href="/en/lessons" className={`${secondaryBtn} col-span-2 w-full`}>
          Tất cả các bài
        </Link>
      </div>
      {progress.goals.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Gợi ý theo mục tiêu của bạn</h2>
          <p className="mt-2 text-base">Các bài dưới đây là bài thật trong lộ trình sơ cấp. Lộ trình không đổi theo mục tiêu.</p>
          <ul className="mt-3 space-y-2">
            {suggestions.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/en/lesson/${lesson.id}`} className="en-panel block px-4 py-3 text-lg font-semibold">
                  Ngày {lesson.day}: {lesson.titleVi}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mt-8 text-base">
        {progress.mic === "listening_only" || progress.mic === "denied"
          ? "Bạn đang học bằng cách nghe. Có thể bật micro sau trong bài nói."
          : "Khi tới phần nói, micro chỉ bật lúc bạn bấm Ghi âm."}
      </p>
    </div>
  );
}
