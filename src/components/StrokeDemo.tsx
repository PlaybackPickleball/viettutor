"use client";

import { useState } from "react";

type Props = {
  strokes: string[];
  grapheme: string;
};

export function StrokeDemo({ strokes, grapheme }: Props) {
  const [playing, setPlaying] = useState(0);
  const [key, setKey] = useState(0);

  function replay() {
    setPlaying(0);
    setKey((k) => k + 1);
    strokes.forEach((_, i) => {
      window.setTimeout(() => setPlaying(i + 1), 700 * (i + 1));
    });
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="quiet-label">Stroke order demo</p>
        <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={replay}>
          Play demo
        </button>
      </div>
      <div className="flex items-center justify-center rounded-2xl border border-ink/10 bg-paper/80 py-4">
        <svg
          key={key}
          viewBox="0 0 200 240"
          className="h-40 w-40"
          aria-label={`Stroke order for ${grapheme}`}
        >
          <text
            x="100"
            y="168"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink/15"
            style={{ fontSize: 128, fontFamily: "var(--font-hand), cursive", fontWeight: 500 }}
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
