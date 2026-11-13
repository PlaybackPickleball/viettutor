"use client";

import { useState } from "react";
import { SAY_TARGET_REPS } from "@/lib/letters";

/** Compact walkthrough for live demos (Nicola). */
export function DemoScript() {
  const [open, setOpen] = useState(true);

  return (
    <section className="ami-card mb-8 mt-8 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="quiet-label">Demo script</p>
          <h2 className="mt-1 font-display text-xl text-ink">Letter a live path</h2>
        </div>
        <button
          type="button"
          className="text-sm text-coral underline-offset-2 hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/75">
          <li>
            Tap <strong>Continue Learning</strong>.
          </li>
          <li>
            <strong>Hear:</strong> Listen, then Next.
          </li>
          <li>
            <strong>Say:</strong> complete <strong>{SAY_TARGET_REPS} takes</strong> (Record or Demo
            practice take). Each tip is Simulated scoring; after {SAY_TARGET_REPS}, read the{" "}
            <em>AI set average</em>, then Write unlocks.
          </li>
          <li>
            <strong>Write:</strong> Play demo / trace / Mark written.
          </li>
          <li>
            <strong>Link:</strong> shirt for <span lang="vi">áo</span>, then next sound. Finish a
            level to unlock the next few letters.
          </li>
        </ol>
      ) : null}
    </section>
  );
}
