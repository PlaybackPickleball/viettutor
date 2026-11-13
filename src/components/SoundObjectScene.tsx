"use client";

import { speakVietnamese } from "@/lib/audio";
import type { LetterLesson } from "@/lib/letters";

type Props = {
  letter: LetterLesson;
};

/** One picture + VN word + EN gloss; tap to re-hear. Not a card stack. */
export function SoundObjectScene({ letter }: Props) {
  async function replay() {
    try {
      await speakVietnamese(letter.wordListenText);
    } catch {
      /* TTS optional */
    }
  }

  return (
    <button
      type="button"
      onClick={replay}
      className="group flex w-full flex-col items-center text-left focus:outline-none"
      aria-label={`Hear ${letter.wordVi}, ${letter.wordEn}`}
    >
      <div
        className="relative mb-6 flex h-56 w-full items-end justify-center overflow-hidden rounded-[2rem] transition group-active:scale-[0.99]"
        style={{
          background: `linear-gradient(160deg, ${letter.sceneHue}55, ${letter.sceneHue}22 40%, #f3f7f4 100%)`,
        }}
      >
        <SceneArt id={letter.id} hue={letter.sceneHue} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]"
        />
      </div>
      <p className="font-display text-4xl text-ink" lang="vi">
        {letter.wordVi}
      </p>
      <p className="mt-1 text-base text-ink/55">{letter.wordEn}</p>
      <p className="mt-4 text-sm text-jade">Tap picture or word to hear again</p>
    </button>
  );
}

function SceneArt({ id, hue }: { id: string; hue: string }) {
  // Simple illustrative SVGs — atmosphere, not emoji stickers
  switch (id) {
    case "a":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <rect x="70" y="50" width="100" height="90" rx="8" fill={hue} opacity="0.85" />
          <path d="M60 55 L120 20 L180 55" fill="none" stroke="#0f2a24" strokeWidth="6" />
          <circle cx="145" cy="85" r="8" fill="#f3f7f4" />
        </svg>
      );
    case "a-breve":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <ellipse cx="120" cy="110" rx="55" ry="28" fill={hue} />
          <path d="M80 100 Q120 60 160 100" fill="#f3f7f4" opacity="0.9" />
          <circle cx="105" cy="88" r="4" fill="#0f2a24" />
        </svg>
      );
    case "a-circumflex":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <circle cx="120" cy="90" r="42" fill={hue} opacity="0.9" />
          <path d="M90 100 Q120 70 150 100" stroke="#f3f7f4" strokeWidth="6" fill="none" />
        </svg>
      );
    case "e":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <rect x="55" y="80" width="130" height="40" rx="12" fill={hue} />
          <circle cx="85" cy="120" r="14" fill="#0f2a24" />
          <circle cx="155" cy="120" r="14" fill="#0f2a24" />
        </svg>
      );
    case "e-circumflex":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <rect x="75" y="70" width="90" height="70" rx="6" fill={hue} />
          <rect x="85" y="55" width="70" height="18" rx="3" fill="#0f2a24" opacity="0.35" />
          <line x1="95" y1="140" x2="95" y2="155" stroke="#0f2a24" strokeWidth="5" />
          <line x1="145" y1="140" x2="145" y2="155" stroke="#0f2a24" strokeWidth="5" />
        </svg>
      );
    case "o":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <ellipse cx="120" cy="105" rx="50" ry="35" fill={hue} />
          <circle cx="100" cy="95" r="5" fill="#0f2a24" />
          <circle cx="135" cy="95" r="5" fill="#0f2a24" />
          <path d="M95 55 L105 85" stroke="#0f2a24" strokeWidth="4" />
          <path d="M140 55 L130 85" stroke="#0f2a24" strokeWidth="4" />
        </svg>
      );
    case "o-circumflex":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <ellipse cx="120" cy="115" rx="70" ry="22" fill={hue} opacity="0.7" />
          <path
            d="M50 115 Q120 70 190 115"
            fill="none"
            stroke={hue}
            strokeWidth="10"
            opacity="0.9"
          />
        </svg>
      );
    case "o-horn":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <circle cx="120" cy="90" r="48" fill={hue} opacity="0.35" />
          <path d="M70 110 Q120 40 170 110" fill="none" stroke={hue} strokeWidth="8" />
          <circle cx="160" cy="55" r="6" fill="#f3f7f4" />
        </svg>
      );
    case "u":
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <path d="M70 40 L70 120 Q120 160 170 120 L170 40" fill="none" stroke={hue} strokeWidth="10" />
          <line x1="120" y1="30" x2="120" y2="55" stroke="#0f2a24" strokeWidth="4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 240 180" className="relative z-10 h-44 w-full max-w-xs">
          <rect x="80" y="55" width="80" height="90" rx="10" fill={hue} />
          <path d="M95 80 H145 M95 105 H145 M95 130 H130" stroke="#f3f7f4" strokeWidth="5" />
        </svg>
      );
  }
}
