"use client";

import { useEffect, useState } from "react";

type Props = {
  strokes: string[];
  grapheme: string;
  /** Auto-play Mali stroke demo when the write studio opens. */
  autoPlay?: boolean;
};

export function StrokeDemo({ strokes, grapheme, autoPlay = true }: Props) {
  const [playing, setPlaying] = useState(0);
  const [key, setKey] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  function replay() {
    setPlaying(0);
    setKey((k) => k + 1);
    strokes.forEach((_, i) => {
      window.setTimeout(() => setPlaying(i + 1), 700 * (i + 1));
    });
  }

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setFontsReady(true);
    };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(markReady);
    } else {
      markReady();
    }
    return () => {
      cancelled = true;
    };
  }, [grapheme]);

  useEffect(() => {
    if (!autoPlay || !fontsReady) return;
    const t = window.setTimeout(() => replay(), 280);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, fontsReady, grapheme, strokes.join("|")]);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="quiet-label">Mali stroke demo</p>
          <p className="mt-0.5 text-xs text-ink/45">Handwriting model · single-storey Vietnamese</p>
        </div>
        <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={replay}>
          Play demo
        </button>
      </div>
      <div className="flex items-center justify-center rounded-2xl border border-ink/10 bg-paper/80 py-4">
        <svg
          key={key}
          viewBox="0 0 200 240"
          className="h-44 w-44 animate-riseIn"
          aria-label={`Mali stroke order for ${grapheme}`}
        >
          <text
            x="100"
            y="168"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-coral/25"
            style={{
              fontSize: 128,
              fontFamily: "var(--font-hand), Mali, cursive",
              fontWeight: 600,
            }}
            lang="vi"
          >
            {grapheme}
          </text>
          {strokes.map((d, i) => (
            <path
              key={`${key}-${i}`}
              d={d}
              fill="none"
              stroke="var(--jade)"
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: playing > i ? 0 : 1,
                transition: "stroke-dashoffset 0.7s ease-in-out",
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
