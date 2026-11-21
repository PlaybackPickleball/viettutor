"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  BADGE_LABELS,
  continuePathHref,
  DEMO_UNLOCK_ALL_PATH,
  getWorldLessons,
  LEARNING_WORLDS,
  lessonMapStatus,
  loadPathProgress,
  masteredSkillSummaries,
  pathMastery,
  skillsDueForReview,
  type LessonMapStatus,
  type PathProgressState,
} from "@/lib/phonics/learningPath";

const STATUS_LABEL: Record<LessonMapStatus, string> = {
  locked: "Locked",
  available: "Open",
  completed: "Done",
  mastered: "Mastered",
};

function starsText(n: number) {
  return `${"★".repeat(n)}${"☆".repeat(Math.max(0, 3 - n))}`;
}

export function DanhVanHomeClient() {
  const [progress, setProgress] = useState<PathProgressState | null>(null);

  useEffect(() => {
    setProgress(loadPathProgress());
  }, []);

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading…</p>
      </div>
    );
  }

  const mastery = pathMastery(progress);
  const href = continuePathHref(progress);
  const due = skillsDueForReview(progress, 6);
  const mastered = masteredSkillSummaries(progress, 8);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Learn · Foundations → Worlds</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Đánh Vần</h1>
          <p className="mt-1 text-ink/60">2.0 path · Southern first · Hear → Write → Say → Review</p>
        </div>
        <Link href="/" className="teacher-btn-secondary px-4 py-2 text-sm">
          Home
        </Link>
      </header>

      <section className="ami-card px-4 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="quiet-label">Course progress</p>
            <p className="mt-1 font-display text-2xl text-ink">
              {mastery.completed}/{mastery.total}
            </p>
            <p className="text-sm text-ink/50">playable micro-lessons</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink/50">XP</p>
            <p className="font-display text-2xl text-coral">{progress.xp}</p>
            {progress.streakDays > 0 ? (
              <p className="text-xs text-ink/45">{progress.streakDays}-day streak</p>
            ) : null}
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${mastery.pct}%` }}
          />
        </div>
        {DEMO_UNLOCK_ALL_PATH ? (
          <p className="mt-4 rounded-2xl bg-soft px-3 py-2 text-xs text-ink/60">
            Demo unlock on — Foundations + 12 worlds (149 lessons) open for testing (mastery gates
            off).
          </p>
        ) : null}
        <Link href={href} className="teacher-btn-primary mt-5 w-full text-center">
          Continue path
        </Link>
        <Link href="/danh-van/review" className="teacher-btn-secondary mt-3 w-full text-center">
          Daily Review{due.length ? ` · ${due.length} due` : ""}
        </Link>
        <Link href="/hear-write" className="teacher-btn-secondary mt-3 w-full text-center">
          Hear & Write · vần combos
        </Link>
        <Link
          href="/danh-van/lesson/ba-sac"
          className="teacher-btn-secondary mt-3 w-full text-center text-sm"
        >
          Intro demo: bờ → a → ba → sắc → bá
        </Link>
        <p className="mt-3 text-xs text-ink/45">
          Alphabet → <span className="font-medium text-ink">Build Syllables</span> → Tones → Read
          Words → Sentences → Karaoke
        </p>
      </section>

      {progress.badges.length ? (
        <section className="mt-5 ami-card px-4 py-4">
          <p className="quiet-label">Badges</p>
          <ul className="mt-2 space-y-1 text-sm text-ink/70">
            {progress.badges.map((id) => (
              <li key={id}>★ {BADGE_LABELS[id] ?? id}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {mastered.length ? (
        <section className="mt-5 ami-card px-4 py-4">
          <p className="quiet-label">Mastery · familiar & mastered</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {mastered.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-coral/10 px-2.5 py-1 text-[11px] text-ink/70 ring-1 ring-coral/25"
              >
                {s.labelEn}
                <span className="ml-1 text-coral/80">· {s.level}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {due.length ? (
        <p className="mt-4 text-xs text-ink/45">
          Spaced review due: {due.length} skill{due.length === 1 ? "" : "s"} — open{" "}
          <Link href="/danh-van/review" className="text-coral underline-offset-2 hover:underline">
            Daily Review
          </Link>
          .
        </p>
      ) : null}

      <section className="mt-8" aria-labelledby="world-map-heading">
        <h2 id="world-map-heading" className="quiet-label">
          World map · Foundations + 12 worlds
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          Foundations pilots + Worlds 1–12 · Southern-first · 149 micro-lessons.
        </p>

        <ol className="relative mt-6 space-y-8 border-l-2 border-coral/25 pl-5">
          {LEARNING_WORLDS.map((world) => {
            const lessons = getWorldLessons(world.id);
            const playableLessons = lessons.filter((l) => l.playable);
            const done = playableLessons.filter(
              (l) =>
                lessonMapStatus(progress, l.id) === "completed" ||
                lessonMapStatus(progress, l.id) === "mastered",
            ).length;
            return (
              <li key={world.id} className="relative">
                <span
                  className={`absolute -left-[1.66rem] top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    world.playable ? "bg-coral text-paper" : "bg-ink/15 text-ink/50"
                  }`}
                  aria-hidden
                >
                  {world.order}
                </span>
                <div className={`ami-card px-4 py-4 ${world.playable ? "" : "opacity-70"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg text-ink">{world.titleEn}</p>
                      <p className="text-sm text-ink/50" lang="vi">
                        {world.titleVi}
                      </p>
                      <p className="mt-1 text-xs text-ink/45">{world.summaryEn}</p>
                    </div>
                    <p className="shrink-0 text-xs text-ink/45">
                      {world.playable ? `${done}/${playableLessons.length}` : "Soon"}
                    </p>
                  </div>

                  {world.playable ? (
                    <ul className="mt-4 space-y-2">
                      {lessons.map((lesson) => {
                        const status = lessonMapStatus(progress, lesson.id);
                        const rec = progress.lessons[lesson.id];
                        const open = status !== "locked";
                        return (
                          <li key={lesson.id}>
                            {open ? (
                              <Link
                                href={`/danh-van/path/${lesson.id}`}
                                className="flex items-center justify-between gap-2 rounded-2xl bg-soft/80 px-3 py-2.5 transition hover:bg-soft"
                              >
                                <span>
                                  <span className="text-xs text-ink/40">
                                    L{lesson.order} · ~{lesson.durationMin}m
                                  </span>
                                  <span className="block text-sm font-medium text-ink">
                                    {lesson.titleEn}
                                  </span>
                                </span>
                                <span className="shrink-0 text-right text-xs text-ink/45">
                                  <span className="block text-coral">
                                    {rec?.stars ? starsText(rec.stars) : STATUS_LABEL[status]}
                                  </span>
                                </span>
                              </Link>
                            ) : (
                              <div className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 opacity-50">
                                <span>
                                  <span className="text-xs text-ink/40">L{lesson.order}</span>
                                  <span className="block text-sm text-ink/60">{lesson.titleEn}</span>
                                </span>
                                <span className="text-xs text-ink/40">Locked</span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-ink/45">
                      12 lessons defined — unlock after earlier worlds. Not playable in this MVP.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-8 ami-card px-4 py-4">
        <p className="quiet-label">Classic intro pack</p>
        <p className="mt-1 text-sm text-ink/55">
          Legacy 12-lesson pack still available for quick drills and karaoke breakdowns.
        </p>
        <Link href="/danh-van/lesson/ba-sac" className="teacher-btn-secondary mt-3 w-full text-center text-sm">
          Open classic bá lesson
        </Link>
      </section>

      <p className="mt-8 text-xs text-ink/45">
        Record/replay only — no invented pronunciation or tone scores. Authored sequences only.
      </p>
    </div>
  );
}
