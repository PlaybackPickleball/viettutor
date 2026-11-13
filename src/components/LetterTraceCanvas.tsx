"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  strokes: string[];
  grapheme: string;
  onTraceComplete?: () => void;
};

export function LetterTraceCanvas({ strokes, grapheme, onTraceComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const pointCount = useRef(0);

  const drawGuides = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(243, 247, 244, 0.95)";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(15, 42, 36, 0.12)";
      ctx.lineWidth = 1;
      const rows = [0.22, 0.5, 0.78];
      for (const r of rows) {
        const y = h * r;
        ctx.beginPath();
        ctx.moveTo(16, y);
        ctx.lineTo(w - 16, y);
        ctx.stroke();
      }

      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = "rgba(31, 107, 85, 0.28)";
      ctx.beginPath();
      ctx.moveTo(16, h * 0.5);
      ctx.lineTo(w - 16, h * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Handwritten model letter (Vietnamese notebook style)
      const hand = getComputedStyle(document.documentElement).getPropertyValue("--font-hand").trim();
      ctx.save();
      ctx.fillStyle = "rgba(31, 107, 85, 0.16)";
      ctx.font = `600 ${Math.floor(h * 0.62)}px ${hand || "Dancing Script"}, cursive`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(grapheme, w / 2, h * 0.55);
      ctx.restore();

      // Stroke-order ghost paths on top
      const scaleX = w / 200;
      const scaleY = h / 240;
      ctx.save();
      ctx.scale(scaleX, scaleY);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(31, 107, 85, 0.2)";
      ctx.lineWidth = 10;
      for (const d of strokes) {
        ctx.stroke(new Path2D(d));
      }
      ctx.restore();
    },
    [strokes, grapheme],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Wait for hand font so guide letter isn’t a fallback face
    const paint = () => {
      drawGuides(ctx, rect.width, rect.height);
    };
    if (document.fonts?.ready) {
      void document.fonts.ready.then(paint);
    } else {
      paint();
    }
    setHasInk(false);
    setFeedback(null);
    pointCount.current = 0;
  }, [drawGuides]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.strokeStyle = "rgba(15, 42, 36, 0.85)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    pointCount.current += 1;
    setHasInk(true);
  }

  function onPointerUp() {
    drawing.current = false;
    if (pointCount.current > 40) {
      setFeedback("Shape looks intentional — nice tracing. ★");
      onTraceComplete?.();
    } else if (pointCount.current > 8) {
      setFeedback("Keep going — follow the handwritten guide a little more fully.");
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawGuides(ctx, rect.width, rect.height);
    setHasInk(false);
    setFeedback(null);
    pointCount.current = 0;
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        className="h-72 w-full touch-none rounded-2xl border border-ink/10 bg-paper shadow-soft"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" className="teacher-btn-secondary" onClick={clear} disabled={!hasInk}>
          Clear / reset
        </button>
      </div>
      {feedback ? (
        <p className="animate-riseIn text-sm text-ink/70" role="status">
          {feedback}
        </p>
      ) : (
        <p className="text-sm text-ink/45">
          Trace the handwritten model with finger or mouse.
        </p>
      )}
    </div>
  );
}
