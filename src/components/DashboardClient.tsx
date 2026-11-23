"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { usePracticeClock } from "@/hooks/usePracticeClock";
import {
  assembleDailyJourney,
  journeyHomeStats,
  nextLessonPreview,
  resolveContinueLearning,
  type ContinueLearningTarget,
  type DailyJourneyPlan,
} from "@/lib/journey";
import { loadProgress } from "@/lib/progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { masteryDueCount, pullMasteryFromServer } from "@/lib/vocabulary/mastery";

type HomeStats = {
  streakDays: number;
  xp: number;
  minutesToday: number;
  reviewDueHint: number;
};

export function DashboardClient() {
  const [continueTarget, setContinueTarget] = useState<ContinueLearningTarget | null>(null);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [nextLesson, setNextLesson] = useState<{ title: string; href: string } | null>(null);
  const [daily, setDaily] = useState<DailyJourneyPlan | null>(null);
  const [speakHref, setSpeakHref] = useState("/studio/a/say");
  const [vocabDue, setVocabDue] = useState(0);
  usePracticeClock(true);

  useEffect(() => {
    void pullMasteryFromServer().then(() => setVocabDue(masteryDueCount()));
    const refresh = () => {
      const target = resolveContinueLearning();
      setContinueTarget(target);
      setStats(journeyHomeStats());
      setNextLesson(nextLessonPreview(target));
      setDaily(assembleDailyJourney());
      setVocabDue(masteryDueCount());
      const letter = loadProgress().currentLetterId || "a";
      setSpeakHref(`/studio/${letter}/say`);
    };
    refresh();
    const id = window.setInterval(refresh, 12_000);
    return () => window.clearInterval(id);
  }, []);

  if (!continueTarget || !stats || !daily) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark size="lg" href={undefined} />
        <p className="mt-10 text-ink/50">Loading your place…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="relative -mx-5 -mt-6 min-h-[10rem] overflow-hidden px-5 pb-4 pt-6">
        <Image
          src="/home/home-hero-pagoda.jpg"
          alt=""
          fill
          priority
          className="pointer-events-none object-cover object-[center_30%] opacity-[0.42]"
          sizes="(max-width: 512px) 100vw, 512px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f8f1e7]/40 via-[#f8f1e7]/70 to-[#f8f1e7]" />
        <div className="relative z-[1]">
          <BrandMark size="lg" href={undefined} />
          <p className="mt-6 font-display text-3xl text-ink">ÁMi Lingua</p>
          <p className="mt-1 text-ink/55">Your Vietnamese learning dashboard</p>
        </div>
      </header>

      {vocabDue > 0 ? (
        <section className="ami-card relative mt-2 overflow-hidden px-4 py-5" aria-labelledby="vocab-review-heading">
          <p className="quiet-label" id="vocab-review-heading">
            Daily Review
          </p>
          <p className="mt-1 font-display text-2xl text-ink">
            {vocabDue} word{vocabDue === 1 ? "" : "s"} due
          </p>
          <p className="mt-1 text-sm text-ink/65">
            Spaced vocabulary — Listen & Type and image recall.
          </p>
          <Link href="/vocab/pack/review" className="teacher-btn-primary mt-5 w-full sm:w-auto">
            Start Daily Review
          </Link>
        </section>
      ) : null}

      <section className="ami-card relative mt-2 overflow-hidden px-4 py-5" aria-labelledby="continue-heading">
        <p className="quiet-label" id="continue-heading">
          Continue Learning
        </p>
        <p className="mt-1 font-display text-2xl text-ink">
          Unit {continueTarget.unitId.replace("u", "")} · {continueTarget.unitTitle}
        </p>
        <p className="mt-1 text-sm text-ink/65">
          {continueTarget.lessonTitle}
          {continueTarget.durationMin > 0 ? (
            <span className="text-ink/45"> · ~{continueTarget.durationMin} min</span>
          ) : null}
        </p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-ink/55">
            <span>{continueTarget.progressLabel}</span>
            <span>{continueTarget.progressPct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${continueTarget.progressPct}%` }}
            />
          </div>
        </div>
        <Link href={continueTarget.href} className="teacher-btn-primary mt-5 w-full sm:w-auto">
          <PlayIcon />
          Continue Learning
        </Link>
        {nextLesson ? (
          <p className="mt-3 text-sm text-ink/50">
            Next:{" "}
            <Link href={nextLesson.href} className="font-medium text-coral underline-offset-2 hover:underline">
              {nextLesson.title}
            </Link>
          </p>
        ) : null}
      </section>

      <section className="mt-5 grid grid-cols-3 gap-3" aria-label="Streak, XP, and time">
        <StatCircle value={`${stats.streakDays}d`} label="Streak" icon="flame" />
        <StatCircle value={String(stats.xp)} label="Path XP" icon="book" />
        <StatCircle value={`${stats.minutesToday}m`} label="Active today" icon="clock" />
      </section>

      {stats.reviewDueHint > 0 ? (
        <p className="mt-4 rounded-2xl bg-soft px-3 py-2.5 text-sm text-ink/65">
          Daily review: {stats.reviewDueHint} skill{stats.reviewDueHint === 1 ? "" : "s"} due —{" "}
          <Link href="/danh-van/review" className="font-medium text-coral underline-offset-2 hover:underline">
            open Review
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-center text-sm text-ink/45">
          <Link href="/danh-van/review" className="font-medium text-coral underline-offset-2 hover:underline">
            Daily Review
          </Link>{" "}
          when skills are due
        </p>
      )}

      <section className="mt-5 grid grid-cols-3 gap-2.5" aria-label="Shortcuts">
        <Shortcut href="/dau-thanh" label="Tones" hint="Dấu Thanh" />
        <Shortcut href="/practice" label="Practice" />
        <Shortcut href={speakHref} label="Speak" hint="Deepgram Say" />
      </section>

      <section className="ami-card mt-6 px-4 py-5" aria-labelledby="daily-journey-heading">
        <p className="quiet-label" id="daily-journey-heading">
          Daily Journey · ~{daily.totalMin} min
        </p>
        <p className="mt-1 font-display text-xl text-ink">Personalized for you</p>
        <p className="mt-1 text-sm text-ink/55">
          Warm up · learn · speak & listen · fun — pulled from your progress.
        </p>
        <ol className="mt-4 space-y-2">
          {daily.blocks.map((block) => (
            <li key={block.phase}>
              <Link
                href={block.href}
                className="flex items-center justify-between gap-2 rounded-2xl bg-soft px-3 py-2.5 text-sm transition hover:bg-paper"
              >
                <span>
                  <span className="font-medium text-ink">{block.titleEn}</span>
                  <span className="mt-0.5 block text-[11px] text-ink/45">{block.blurb}</span>
                </span>
                <span className="shrink-0 text-[11px] text-coral">~{block.durationMin}m</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href={daily.blocks[0]?.href ?? continueTarget.href} className="teacher-btn-primary mt-4 w-full text-center">
          Start Daily Journey
        </Link>
      </section>

      <section className="mt-6 ami-card px-4 py-4">
        <p className="quiet-label">Path</p>
        <p className="mt-1 font-display text-lg text-ink">See all units</p>
        <p className="mt-1 text-sm text-ink/55">
          Unit 1 Discover · Đánh Vần Foundations · karaoke later.
        </p>
        <Link href="/learn" className="teacher-btn-secondary mt-4 w-full text-center sm:w-auto">
          Open Learn
        </Link>
      </section>

      <section className="border-t border-[#e0d0bc] pt-6 text-sm text-ink/45">
        <p>Dialect: Southern Vietnamese (first). Cream & coral ÁMi Lingua.</p>
        <p className="mt-1">
          Progress saves on this device
          {isSupabaseConfigured() ? " · Supabase connected" : " · Supabase stub ready"}.
        </p>
        <p className="mt-3">
          <Link href="/profile" className="font-medium text-ink underline">
            Profile & settings
          </Link>
        </p>
      </section>
    </div>
  );
}

function Shortcut({ href, label, hint }: { href: string; label: string; hint?: string }) {
  return (
    <Link
      href={href}
      className="ami-card flex flex-col items-center px-2 py-3 text-center transition hover:bg-paper"
    >
      <span className="font-display text-base text-ink">{label}</span>
      {hint ? <span className="mt-0.5 text-[10px] text-ink/45">{hint}</span> : null}
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
