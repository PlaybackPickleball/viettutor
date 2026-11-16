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
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">Học Tiếng Anh</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--en-navy)]">{greetingVi(hour)}</h1>
        </div>
        <Link href="/settings" className={secondaryBtn}>
          Cài đặt
        </Link>
      </header>
      <p className="mt-4 text-lg">
        Bài đã xong: {done}/{total}
      </p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#1b2a4a]/10" aria-hidden>
        <div className="h-full bg-[#115e59]" style={{ width: `${Math.round((done / total) * 100)}%` }} />
      </div>
      {!progress.onboardingCompleted ? (
        <p className="mt-4 text-lg">
          Bạn có thể làm quen với lớp, hoặc học thử bài chào hỏi ngay.
        </p>
      ) : null}
      <div className="mt-5 flex flex-col gap-3">
        <Link href={`/en/lesson/${next.lessonId}`} className={primaryBtn}>
          Tiếp tục học
        </Link>
        {!progress.onboardingCompleted ? (
          <Link href="/en/onboarding" className={secondaryBtn}>
            Làm quen với lớp học
          </Link>
        ) : null}
        <Link href={`/en/lesson/${next.lessonId}`} className={secondaryBtn}>
          Luyện phát âm
        </Link>
        <Link href="/en/speak" className={secondaryBtn}>
          Nói với giáo viên
        </Link>
        <Link href="/en/review" className={secondaryBtn}>
          Ôn từ vựng{due.length ? ` · ${due.length}` : ""}
        </Link>
        <Link href="/en/sing" className={secondaryBtn}>
          Bài hát
        </Link>
        <Link href="/en/lessons" className={secondaryBtn}>
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
                <Link href={`/en/lesson/${lesson.id}`} className="text-lg underline">
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
