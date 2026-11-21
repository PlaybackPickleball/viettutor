"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  JOURNEY_UNITS,
  isJourneyUnitUnlocked,
  journeyLessonStatus,
  loadJourneyProgress,
  markJourneyLessonComplete,
  resolveContinueLearning,
  unitLiveProgress,
  type ContinueLearningTarget,
  type JourneyLessonStatus,
  type JourneyProgressState,
} from "@/lib/journey";
import { loadPathProgress, type PathProgressState } from "@/lib/phonics/learningPath";
import { loadProgress, type ProgressState } from "@/lib/progress";

const STATUS_LABEL: Record<JourneyLessonStatus, string> = {
  locked: "Locked",
  available: "Open",
  completed: "Done — review",
  coming_soon: "Coming soon",
};

export function LearnPathClient() {
  const [ready, setReady] = useState(false);
  const [journey, setJourney] = useState<JourneyProgressState | null>(null);
  const [alphabet, setAlphabet] = useState<ProgressState | null>(null);
  const [path, setPath] = useState<PathProgressState | null>(null);
  const [continueTarget, setContinueTarget] = useState<ContinueLearningTarget | null>(null);

  useEffect(() => {
    const refresh = () => {
      const j = loadJourneyProgress();
      const a = loadProgress();
      const p = loadPathProgress();
      setJourney(j);
      setAlphabet(a);
      setPath(p);
      setContinueTarget(resolveContinueLearning(j, a, p));
      setReady(true);
    };
    refresh();
    const id = window.setInterval(refresh, 12_000);
    return () => window.clearInterval(id);
  }, []);

  if (!ready || !journey || !alphabet || !path || !continueTarget) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading path…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-6">
        <BrandMark />
        <p className="quiet-label mt-3">Guided path</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Learn</h1>
        <p className="mt-1 text-ink/60">
          Units unlock in order · finish a live lesson to open the next · completed stay reviewable
        </p>
      </header>

      <section className="ami-card px-4 py-5">
        <p className="quiet-label">Continue</p>
        <p className="mt-1 font-display text-xl text-ink">
          Unit {continueTarget.unitId.replace("u", "")} · {continueTarget.unitTitle}
        </p>
        <p className="mt-1 text-sm text-ink/60">
          {continueTarget.lessonTitle}
          {continueTarget.durationMin > 0 ? ` · ~${continueTarget.durationMin} min` : ""}
        </p>
        <p className="mt-1 text-xs text-ink/45">{continueTarget.progressLabel}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${continueTarget.progressPct}%` }}
          />
        </div>
        <Link
          href={continueTarget.href}
          className="teacher-btn-primary mt-4 w-full text-center"
          onClick={() => {
            if (continueTarget.lessonId === "u7-library" || continueTarget.lessonId === "u3-more") {
              markJourneyLessonComplete(continueTarget.lessonId);
            }
          }}
        >
          Continue Learning
        </Link>
      </section>

      <ol className="relative mt-8 space-y-8 border-l-2 border-coral/25 pl-5">
        {JOURNEY_UNITS.map((unit) => {
          const unlocked = isJourneyUnitUnlocked(unit.id, journey, alphabet, path);
          const prog = unitLiveProgress(unit.id, journey, alphabet, path);
          return (
            <li key={unit.id} className="relative">
              <span
                className={`absolute -left-[1.66rem] top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  unlocked ? "bg-coral text-paper" : "bg-ink/15 text-ink/50"
                }`}
                aria-hidden
              >
                {unit.order}
              </span>
              <div className={`ami-card px-4 py-4 ${unlocked ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg text-ink">
                      Unit {unit.order} · {unit.titleEn}
                    </p>
                    <p className="text-xs text-ink/50" lang="vi">
                      {unit.titleVi}
                    </p>
                    <p className="mt-1 text-sm text-ink/60">{unit.blurb}</p>
                  </div>
                  <p className="text-xs text-ink/45">
                    {prog.total > 0
                      ? `${prog.completed}/${prog.total} live`
                      : `Target ${unit.targetLessonCount} · shell`}
                  </p>
                </div>

                {!unlocked ? (
                  <p className="mt-3 text-sm text-ink/50">
                    {unit.id === "u7"
                      ? "Finish Unit 2 · Six tones to unlock karaoke hooks."
                      : "Finish the previous unit’s live lessons to unlock."}
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {unit.lessons.map((lesson) => {
                      const status = journeyLessonStatus(lesson, journey, alphabet, path);
                      const clickable =
                        (status === "available" || status === "completed") && Boolean(lesson.href);
                      const inner = (
                        <>
                          <span className="font-medium text-ink">{lesson.titleEn}</span>
                          <span className="text-[11px] text-ink/45">
                            {STATUS_LABEL[status]}
                            {lesson.durationMin > 0 ? ` · ${lesson.durationMin}m` : ""}
                          </span>
                        </>
                      );
                      return (
                        <li key={lesson.id}>
                          {clickable ? (
                            <Link
                              href={lesson.href!}
                              className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-sm ring-1 ${
                                status === "completed"
                                  ? "bg-coral/10 ring-coral/25"
                                  : "bg-soft ring-transparent hover:bg-paper"
                              }`}
                              onClick={() => {
                                if (lesson.id === "u7-library" || lesson.id === "u3-more") {
                                  markJourneyLessonComplete(lesson.id);
                                }
                              }}
                            >
                              {inner}
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between gap-2 rounded-2xl bg-ink/[0.03] px-3 py-2.5 text-sm text-ink/45">
                              {inner}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 text-center text-sm text-ink/50">
        Full Đánh Vần world map stays at{" "}
        <Link href="/danh-van" className="font-medium text-coral underline-offset-2 hover:underline">
          /danh-van
        </Link>
        .
      </p>
    </div>
  );
}
