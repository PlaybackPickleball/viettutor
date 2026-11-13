"use client";

import { useState } from "react";

/** Compact 60–90s walkthrough for live demos (Nicola). */
export function DemoScript() {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-8 rounded-2xl border border-jade/25 bg-paper/75 px-4 py-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="quiet-label">Demo script · ~75s</p>
          <h2 className="mt-1 font-display text-xl text-ink">Letter a live path</h2>
        </div>
        <button
          type="button"
          className="text-sm text-jade underline-offset-2 hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/75">
          <li>
            Tap <strong>Begin Level 1 · a</strong>.
          </li>
          <li>
            <strong>Hear:</strong> tap Listen (say “a” with the teacher), then <strong>Next: Say it</strong>.
          </li>
          <li>
            <strong>Say:</strong> Listen once. Record ~1s saying “a”, or use{" "}
            <em>Demo practice take</em> if mic is blocked. First tip = why-wrong (Simulated). Second
            take unlocks Write.
          </li>
          <li>
            <strong>Write:</strong> Play demo, optionally trace, or <strong>Mark written & continue</strong>.
          </li>
          <li>
            <strong>Link:</strong> show the shirt for <span lang="vi">áo</span>, tap to re-hear, then
            Next sound.
          </li>
        </ol>
      ) : null}
    </section>
  );
}
