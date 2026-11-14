"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ami-lingua.get-started.v1";

/**
 * Lightweight first-run popup + reopenable tip for how to use ÁMi Lingua.
 */
export function GetStartedGuide() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY) === "1";
      setOpen(!seen);
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* */
    }
    setOpen(false);
  }

  function reopen() {
    setOpen(true);
  }

  if (!ready) return null;

  return (
    <>
      <button
        type="button"
        onClick={reopen}
        className="fixed bottom-[4.75rem] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#e0d0bc] bg-paper text-sm font-medium text-coral shadow-soft"
        aria-label="How to get started"
        title="How to get started"
      >
        ?
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="get-started-title"
          onClick={dismiss}
        >
          <div
            className="ami-card w-full max-w-md animate-riseIn px-5 py-5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="quiet-label">Quick guide</p>
            <h2 id="get-started-title" className="mt-1 font-display text-2xl text-ink">
              How to get started
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
              <li>
                <span className="font-medium text-ink">Home / Learn</span> — practice Vietnamese
                letters: hear, say, and write one sound at a time.
              </li>
              <li>
                <span className="font-medium text-ink">Sing</span> — open a karaoke song. Use{" "}
                <em>Learn</em> to tap words, <em>Sing</em> with the track, and <em>Practice</em> to
                hear AI say a word or the whole phrase.
              </li>
              <li>
                <span className="font-medium text-ink">Scan</span> — photograph Vietnamese text and
                tap words to learn them.
              </li>
            </ol>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/sing" className="teacher-btn-primary w-full text-center" onClick={dismiss}>
                Start with Sing
              </Link>
              <button type="button" className="teacher-btn-secondary w-full" onClick={dismiss}>
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
