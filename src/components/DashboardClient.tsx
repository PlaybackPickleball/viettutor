"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { DemoScript } from "@/components/DemoScript";
import {
  LEVELS,
  getLetter,
  getLettersForLevel,
  getLevel,
} from "@/lib/letters";
import {
  maxStars,
  motivationLine,
  starsForLetter,
  totalStars,
} from "@/lib/motivation";
import {
  continueHref,
  currentLevelId,
  isLetterComplete,
  isLevelUnlocked,
  levelMastery,
  loadProgress,
  masteryCounts,
  practiceStreak,
  type ProgressState,
} from "@/lib/progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function DashboardClient() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark size="lg" href={undefined} />
        <p className="mt-10 text-ink/50">Loading your place…</p>
      </div>
    );
  }

  const counts = masteryCounts(progress);
  const current = getLetter(progress.currentLetterId);
  const href = continueHref(progress);
  const stars = totalStars(progress);
  const starCap = maxStars();
  const streak = practiceStreak(progress);
  const activeLevel = currentLevelId(progress);
  const activeMeta = getLevel(activeLevel);
  const activeMastery = levelMastery(progress, activeLevel);
  const lessonPct =
    activeMastery.total === 0
      ? 0
      : Math.round((activeMastery.mastered / activeMastery.total) * 100);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="mb-6 flex items-start justify-between gap-3">
        <BrandMark size="lg" href={undefined} />
        <button
          type="button"
          className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#e0d0bc] bg-paper text-ink/50"
          aria-label="Notifications"
        >
          <BellIcon />
        </button>
      </div>

      <p className="font-display text-3xl text-ink">Xin chào, Nicola</p>
      <p className="mt-1 text-ink/55">Ready for today’s sounds?</p>

      <section className="ami-card mt-6 px-4 py-4" id="learn">
        <p className="quiet-label">Current course</p>
        <p className="mt-1 font-display text-xl text-ink">Vietnamese Foundations</p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-ink/60">
            <span>
              Level {activeLevel}: {activeMeta?.title ?? "Sounds"}
            </span>
            <span>{lessonPct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${lessonPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink/45">{activeMeta?.subtitle}</p>
        </div>
        <Link href={href} className="teacher-btn-primary mt-5 w-full">
          Continue Learning
          {current ? (
            <span className="opacity-90" lang="vi">
              · {current.grapheme}
            </span>
          ) : null}
        </Link>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3" id="progress" aria-label="Practice stats">
        <StatCircle value={String(counts.mastered)} label="Sounds mastered" icon="wave" />
        <StatCircle value={`${streak} days`} label="Practice streak" icon="flame" />
        <StatCircle value={`${progress.minutesToday} min`} label="Time today" icon="clock" />
      </section>

      <section className="ami-card mt-6 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="quiet-label">Teacher stamps</p>
            <p className="mt-1 font-display text-2xl text-ink">
              <span className="text-coral" aria-hidden>
                ★
              </span>{" "}
              {stars}
              <span className="text-base font-sans font-normal text-ink/45"> / {starCap}</span>
            </p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-coral"
              style={{ width: `${Math.min(100, (stars / starCap) * 100)}%` }}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-ink/65">{motivationLine(progress)}</p>
      </section>

      <DemoScript />

      <section className="mb-4 mt-2 space-y-5" aria-labelledby="levels-heading">
        <h2 id="levels-heading" className="quiet-label">
          Alphabet path · {LEVELS.length} levels
        </h2>
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(progress, level.id);
          const letters = getLettersForLevel(level.id);
          const { mastered, total } = levelMastery(progress, level.id);
          return (
            <div
              key={level.id}
              className={`ami-card px-4 py-4 ${unlocked ? "" : "opacity-55"}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink">
                    Level {level.id} · {level.title}
                  </p>
                  <p className="text-xs text-ink/50">{level.subtitle}</p>
                </div>
                <p className="text-xs text-ink/45">
                  {unlocked ? `${mastered}/${total}` : "Locked"}
                </p>
              </div>
              {!unlocked ? (
                <p className="text-sm text-ink/50">
                  Finish Level {level.id - 1} to unlock these sounds.
                </p>
              ) : (
                <ul className="grid grid-cols-5 gap-2">
                  {letters.map((letter) => {
                    const p = progress.letters[letter.id];
                    const done = isLetterComplete(p);
                    const started = Boolean(
                      p && (p.heard || p.attempts || p.written || p.objectSeen),
                    );
                    const letterStars = starsForLetter(p);
                    return (
                      <li key={letter.id}>
                        <Link
                          href={`/studio/${letter.id}/hear`}
                          className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl transition ${
                            done
                              ? "bg-coral text-paper"
                              : started
                                ? "bg-amber/20 text-ink ring-1 ring-coral/35"
                                : "bg-soft text-ink/55 hover:bg-paper"
                          }`}
                          lang="vi"
                          aria-label={`Sound ${letter.grapheme}${done ? ", mastered" : ""}`}
                        >
                          <span className="font-hand text-2xl font-medium leading-none sm:text-3xl">
                            {letter.grapheme}
                          </span>
                          {letterStars > 0 ? (
                            <span
                              className={`mt-1 text-[9px] ${done ? "text-paper/80" : "text-coral"}`}
                              aria-hidden
                            >
                              {"★".repeat(Math.min(4, letterStars))}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      <section className="border-t border-[#e0d0bc] pt-6 text-sm text-ink/45">
        <p>Dialect: Southern Vietnamese (first).</p>
        <p className="mt-1">
          Progress saves on this device
          {isSupabaseConfigured() ? " · Supabase connected" : " · Supabase stub ready"}.
        </p>
        <p className="mt-1">
          {counts.total} sounds across {LEVELS.length} levels · 10 takes per sound · Simulated
          scoring.
        </p>
      </section>
    </div>
  );
}

function StatCircle({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: "wave" | "flame" | "clock";
}) {
  return (
    <div className="ami-card flex flex-col items-center px-2 py-4 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-soft text-coral">
        {icon === "wave" ? "〰" : icon === "flame" ? "✦" : "◷"}
      </div>
      <p className="font-display text-lg leading-tight text-ink">{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-ink/50">{label}</p>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
