"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
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
  const activeLetters = getLettersForLevel(activeLevel);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="relative -mx-5 -mt-6 min-h-[11.5rem] overflow-hidden px-5 pb-5 pt-6">
        <Image
          src="/home/home-hero-pagoda.jpg"
          alt=""
          fill
          priority
          className="pointer-events-none object-cover object-[center_30%] opacity-[0.42]"
          sizes="(max-width: 512px) 100vw, 512px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f8f1e7]/40 via-[#f8f1e7]/70 to-[#f8f1e7]" />
        <div className="relative z-[1] flex items-start justify-between gap-3">
          <BrandMark size="lg" href={undefined} />
          <button
            type="button"
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#e0d0bc] bg-paper/90 text-ink/50 backdrop-blur-sm"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>
        </div>
        <div className="relative z-[1] mt-8">
          <p className="font-display text-3xl text-ink">Xin chào, Nicola</p>
          <p className="mt-1 text-ink/55">Ready for today’s sounds?</p>
        </div>
      </header>

      <section className="ami-card relative mt-2 overflow-hidden px-4 py-4" id="learn">
        <div className="relative z-[1] max-w-[62%]">
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
            <p className="mt-2 text-xs text-ink/45" lang="vi">
              {activeLetters.map((l) => l.grapheme).join(" · ")}
            </p>
          </div>
          <Link href={href} className="teacher-btn-primary mt-5 w-full sm:w-auto">
            <PlayIcon />
            Continue Learning
            {current ? (
              <span className="opacity-90" lang="vi">
                · {current.grapheme}
              </span>
            ) : null}
          </Link>
        </div>
        <div className="pointer-events-none absolute -bottom-2 -right-3 h-36 w-36 sm:h-40 sm:w-40">
          <Image
            src="/home/home-course-nonla.jpg"
            alt=""
            fill
            className="object-contain drop-shadow-md"
            sizes="160px"
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3" id="progress" aria-label="Practice stats">
        <StatCircle value={String(counts.mastered)} label="Sounds mastered" icon="book" />
        <StatCircle value={`${streak} days`} label="Practice streak" icon="flame" />
        <StatCircle value={`${progress.minutesToday} min`} label="Time today" icon="clock" />
      </section>

      <section className="ami-card relative mt-6 overflow-hidden px-4 py-4">
        <div className="relative z-[1] flex items-center justify-between gap-3 pr-20">
          <div>
            <p className="quiet-label">Teacher stamps</p>
            <p className="mt-1 font-display text-2xl text-ink">
              <span className="text-coral" aria-hidden>
                ★
              </span>{" "}
              {stars}
              <span className="text-base font-sans font-normal text-ink/45"> / {starCap}</span>
            </p>
            <div className="mt-3 h-2 w-28 overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-coral"
                style={{ width: `${Math.min(100, (stars / starCap) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-ink/65">{motivationLine(progress)}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-1 -right-1 h-24 w-24 rotate-6 sm:h-28 sm:w-28">
          <Image
            src="/home/home-teacher-stamp.jpg"
            alt=""
            fill
            className="rounded-lg object-cover shadow-soft ring-1 ring-[#e0d0bc]/80"
            sizes="112px"
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-2.5" aria-label="Ways to practice">
        <FeatureThumb
          href="/scan"
          src="/home/home-feature-scan.jpg"
          title="Photograph Vietnamese"
        />
        <FeatureThumb
          href="/sing"
          src="/home/home-feature-sing.jpg"
          title="Learn through karaoke"
        />
        <FeatureThumb
          href={href.includes("/write") ? href : `/studio/${progress.currentLetterId || "a"}/write`}
          src="/home/home-feature-write.jpg"
          title={`Letter ${current?.grapheme ?? "a"} live path`}
        />
      </section>

      <section className="mb-4 mt-8 space-y-5" aria-labelledby="levels-heading">
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
      </section>
    </div>
  );
}

function FeatureThumb({
  href,
  src,
  title,
}: {
  href: string;
  src: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="ami-card group relative flex flex-col overflow-hidden p-0 transition hover:bg-paper"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image src={src} alt="" fill className="object-cover transition group-hover:scale-[1.03]" sizes="140px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f16]/55 via-transparent to-transparent" />
        <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-paper text-xs shadow-soft">
          →
        </span>
      </div>
      <p className="px-2.5 py-2.5 text-[11px] font-medium leading-snug text-ink">{title}</p>
    </Link>
  );
}

function StatCircle({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: "book" | "flame" | "clock";
}) {
  return (
    <div className="ami-card flex flex-col items-center px-2 py-4 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-soft text-coral">
        {icon === "book" ? <BookIcon /> : icon === "flame" ? <FlameIcon /> : <ClockIcon />}
      </div>
      <p className="font-display text-lg leading-tight text-ink">{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-ink/50">{label}</p>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M4 19.5h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c2 3 1 5 3 7 2 2 4 3 4 7a7 7 0 1 1-14 0c0-3 2-5 3-7 1-2 2-4 4-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
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
