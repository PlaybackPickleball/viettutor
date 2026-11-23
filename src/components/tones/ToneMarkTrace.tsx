"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Empty for ngang — shows “no mark” guidance. */
  strokePath: string;
  guideEn: string;
  markLabel: string;
  onStamped?: () => void;
};

/**
 * Animated stroke demo + finger/mouse trace for tone marks.
 * Shape practice only — never scored as handwriting accuracy.
 */
export function ToneMarkTrace({ strokePath, guideEn, markLabel, onStamped }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
  }, [strokePath, stamped]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!strokePath) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.strokeStyle = "var(--coral)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onUp() {
    drawing.current = false;
  }

  function stamp() {
    setStamped(true);
    onStamped?.();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink/60">{guideEn}</p>
      {!strokePath ? (
        <div className="ami-card px-4 py-6 text-center">
          <p className="font-display text-2xl text-ink">No mark</p>
          <p className="mt-1 text-sm text-ink/55">
            Ngang is a tone category with no written mark — five marks cover the other five.
          </p>
          <button type="button" className="teacher-btn-primary mt-4" onClick={stamp}>
            Got it — continue
          </button>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-[#e8d9c8] bg-paper">
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
              aria-hidden
            >
              <path
                d={strokePath}
                fill="none"
                stroke="var(--coral)"
                strokeWidth="3"
                strokeLinecap="round"
                className="tone-pitch-draw"
              />
            </svg>
            <canvas
              ref={canvasRef}
              className="relative z-[1] h-44 w-full touch-none"
              aria-label={`Trace ${markLabel}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>
          <p className="text-xs text-ink/45">
            Trace the dashed guide — shape practice only, never a handwriting score.
          </p>
          <button type="button" className="teacher-btn-secondary w-full" onClick={stamp}>
            Stamp practice · continue
          </button>
        </>
      )}
    </div>
  );
}
