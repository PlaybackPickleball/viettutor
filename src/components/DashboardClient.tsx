"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { LEVEL1_LETTERS, getLetter } from "@/lib/letters";
import {
  continueHref,
  isLetterComplete,
  loadProgress,
  masteryCounts,
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
      <div className="studio-shell">
        <BrandMark size="lg" href={undefined} />
        <p className="mt-10 text-ink/50">Loading your place…</p>
      </div>
    );
  }

  const counts = masteryCounts(progress);
  const current = getLetter(progress.currentLetterId);
  const href = continueHref(progress);

  return (
    <div className="studio-shell animate-riseIn">
      <div className="relative mb-10 overflow-hidden pb-2 pt-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 animate-breathe rounded-full bg-leaf/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-8 h-48 w-48 rounded-full bg-amber/20 blur-3xl"
        />
        <BrandMark size="lg" href={undefined} />
        <h1 className="sr-only">ÁMi Lingua</h1>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink/70">
          Learn one sound at a time — hear it, say it, write it, then meet its picture.
        </p>
        <Link href={href} className="teacher-btn-primary mt-8 inline-flex">
          {counts.mastered === 0 && counts.inProgress === 0 ? "Begin Level 1" : "Continue"}
          {current ? (
            <span className="opacity-80" lang="vi">
              · {current.grapheme}
            </span>
          ) : null}
        </Link>
      </div>

      <section className="mb-10" aria-labelledby="mastery-heading">
        <h2 id="mastery-heading" className="quiet-label mb-3">
          Level 1 sounds
        </h2>
        <p className="mb-4 text-sm text-ink/55">
          {counts.mastered} mastered · {counts.inProgress} in progress · {counts.total} total
        </p>
        <ul className="grid grid-cols-5 gap-2">
          {LEVEL1_LETTERS.map((letter) => {
            const p = progress.letters[letter.id];
            const done = isLetterComplete(p);
            const started = Boolean(p && (p.heard || p.attempts || p.written || p.objectSeen));
            return (
              <li key={letter.id}>
                <Link
                  href={`/studio/${letter.id}/hear`}
                  className={`flex aspect-square items-center justify-center rounded-2xl text-2xl font-display transition ${
                    done
                      ? "bg-jade text-paper"
                      : started
                        ? "bg-amber/25 text-ink ring-1 ring-amber/40"
                        : "bg-paper/70 text-ink/55 hover:bg-soft"
                  }`}
                  lang="vi"
                  aria-label={`Sound ${letter.grapheme}${done ? ", mastered" : ""}`}
                >
                  {letter.grapheme}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-ink/10 pt-6 text-sm text-ink/45">
        <p>Dialect: Southern Vietnamese (first).</p>
        <p className="mt-1">
          Progress saves on this device
          {isSupabaseConfigured() ? " · Supabase connected" : " · Supabase stub ready"}.
        </p>
        <p className="mt-1">Pronunciation feedback is labeled Simulated scoring until validated.</p>
      </section>
    </div>
  );
}
