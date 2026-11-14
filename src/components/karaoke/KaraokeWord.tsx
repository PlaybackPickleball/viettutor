"use client";

import type { LyricToken } from "@/lib/karaoke/types";
import { wordFillProgress } from "@/lib/karaoke/types";

type Props = {
  token: LyricToken;
  currentMs: number;
  showGloss: boolean;
  gloss?: string;
  selected?: boolean;
  onTap: (token: LyricToken) => void;
};

/**
 * Progressive coral fill over the Vietnamese word based on audio clock progress.
 */
export function KaraokeWord({ token, currentMs, showGloss, gloss, selected, onTap }: Props) {
  const progress = wordFillProgress(currentMs, token.startMs, token.endMs);
  const active = progress > 0 && progress < 1;
  const done = progress >= 1;

  return (
    <button
      type="button"
      onClick={() => onTap(token)}
      className={`inline-flex max-w-full flex-col items-center rounded-xl px-1.5 py-1 transition ${
        selected ? "bg-amber/20 ring-1 ring-coral/40" : "hover:bg-soft/80"
      }`}
      aria-label={token.text}
      lang="vi"
    >
      <span className="relative inline-block text-2xl font-medium leading-snug tracking-tight">
        {/* Base (unfilled) */}
        <span className={done ? "text-coral" : "text-ink/35"}>{token.text}</span>
        {/* Progressive fill overlay */}
        {!done ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 overflow-hidden whitespace-nowrap text-coral"
            style={{ width: `${Math.round(progress * 1000) / 10}%` }}
          >
            {token.text}
          </span>
        ) : null}
        {active ? (
          <span className="sr-only">
            {Math.round(progress * 100)}% through word
          </span>
        ) : null}
      </span>
      {showGloss && gloss ? (
        <span className="mt-0.5 max-w-[6.5rem] truncate text-center text-[11px] leading-tight text-ink/45">
          {gloss}
        </span>
      ) : null}
    </button>
  );
}
