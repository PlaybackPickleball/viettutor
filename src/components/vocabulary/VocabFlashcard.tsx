"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakCompareAssess } from "@/components/phonics/path/SpeakCompareAssess";
import { speakVietnamese } from "@/lib/audio";
import { packImageUrl, type PackWord } from "@/lib/vocabulary";

type Props = {
  word: PackWord;
  /** When false, skip Deepgram speak panel (list preview). */
  withSpeak?: boolean;
  onKnow?: () => void;
  onAgain?: () => void;
  onSpoken?: () => void;
  showActions?: boolean;
};

/**
 * Consistent card: fixed illustration frame (aspect-square), VI + EN, native TTS,
 * optional Deepgram match — no invented scores.
 */
export function VocabFlashcard({
  word,
  withSpeak = true,
  onKnow,
  onAgain,
  onSpoken,
  showActions = true,
}: Props) {
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={rootRef}
      className="ami-card flex w-full flex-col overflow-hidden p-3 sm:p-4"
      aria-label={`${word.vi} — ${word.en}`}
    >
      {/* Square frame: warm paper fill, rounded corners only — no border/clip padding; text stays below */}
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-paper">
        {inView ? (
          // eslint-disable-next-line @next/next/no-img-element -- lazy public WebP; keep aspect via CSS
          <img
            src={packImageUrl(word)}
            alt=""
            width={1254}
            height={1254}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        ) : (
          <div className="absolute inset-0 h-full w-full animate-pulse bg-ink/5" aria-hidden />
        )}
      </div>

      <p className="mt-3 text-center font-display text-3xl text-ink" lang="vi">
        {word.vi}
      </p>
      <p className="mt-1 text-center text-sm text-ink/55">{word.en}</p>
      <p className="mt-1 text-center text-[11px] text-ink/40">{word.category}</p>

      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          className="teacher-btn-secondary px-4 py-2 text-sm"
          onClick={() => void speakVietnamese(word.vi)}
        >
          Hear
        </button>
      </div>

      {withSpeak ? (
        <div className="mt-4">
          <SpeakCompareAssess
            itemId={`pack-${word.id}`}
            expectedText={word.vi}
            onPlayNative={() => void speakVietnamese(word.vi)}
            onPracticed={onSpoken}
          />
        </div>
      ) : null}

      {showActions && (onKnow || onAgain) ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-2xl bg-soft px-3 py-3 text-sm text-ink/70"
            onClick={onAgain}
          >
            Again
          </button>
          <button
            type="button"
            className="rounded-2xl bg-coral px-3 py-3 text-sm text-paper"
            onClick={onKnow}
          >
            Know
          </button>
        </div>
      ) : null}
    </article>
  );
}
