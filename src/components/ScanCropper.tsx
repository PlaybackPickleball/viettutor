"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CropRect } from "@/lib/services/imageCompress";

type Props = {
  src: string;
  crop: CropRect;
  onChange: (crop: CropRect) => void;
};

type DragMode =
  | { kind: "move"; startX: number; startY: number; origin: CropRect }
  | { kind: "new"; startX: number; startY: number }
  | { kind: "resize"; corner: Corner; startX: number; startY: number; origin: CropRect }
  | null;

type Corner = "nw" | "ne" | "sw" | "se";

/**
 * Drag a rectangle over the photo to choose which Vietnamese text to read.
 * Coordinates are normalized 0–1 relative to the image content box.
 */
export function ScanCropper({ src, crop, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState({ left: 0, top: 0, width: 1, height: 1 });
  const drag = useRef<DragMode>(null);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img || !img.naturalWidth) return;
    const wr = wrap.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    setBox({
      left: ir.left - wr.left,
      top: ir.top - wr.top,
      width: ir.width,
      height: ir.height,
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, src]);

  function clientToNorm(clientX: number, clientY: number) {
    const wrap = wrapRef.current;
    if (!wrap || box.width <= 0 || box.height <= 0) return { x: 0, y: 0 };
    const wr = wrap.getBoundingClientRect();
    const x = (clientX - wr.left - box.left) / box.width;
    const y = (clientY - wr.top - box.top) / box.height;
    return { x: clamp(x, 0, 1), y: clamp(y, 0, 1) };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!wrapRef.current) return;
    const target = e.target as HTMLElement;
    const corner = target.dataset.corner as Corner | undefined;
    const p = clientToNorm(e.clientX, e.clientY);
    wrapRef.current.setPointerCapture(e.pointerId);

    if (corner) {
      drag.current = { kind: "resize", corner, startX: p.x, startY: p.y, origin: crop };
    } else if (insideCrop(p.x, p.y, crop)) {
      drag.current = { kind: "move", startX: p.x, startY: p.y, origin: { ...crop } };
    } else {
      drag.current = { kind: "new", startX: p.x, startY: p.y };
      onChange({ x: p.x, y: p.y, w: 0.02, h: 0.02 });
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = clientToNorm(e.clientX, e.clientY);

    if (d.kind === "new") {
      onChange(normRect(d.startX, d.startY, p.x, p.y));
      return;
    }
    if (d.kind === "move") {
      const dx = p.x - d.startX;
      const dy = p.y - d.startY;
      onChange({
        x: clamp(d.origin.x + dx, 0, 1 - d.origin.w),
        y: clamp(d.origin.y + dy, 0, 1 - d.origin.h),
        w: d.origin.w,
        h: d.origin.h,
      });
      return;
    }
    // resize
    let { x, y, w, h } = d.origin;
    const right = x + w;
    const bottom = y + h;
    if (d.corner.includes("w")) x = Math.min(p.x, right - 0.04);
    if (d.corner.includes("e")) w = Math.max(0.04, p.x - x);
    if (d.corner.includes("n")) y = Math.min(p.y, bottom - 0.04);
    if (d.corner.includes("s")) h = Math.max(0.04, p.y - y);
    if (d.corner.includes("w")) w = right - x;
    if (d.corner.includes("n")) h = bottom - y;
    onChange({
      x: clamp(x, 0, 1),
      y: clamp(y, 0, 1),
      w: clamp(w, 0.04, 1 - clamp(x, 0, 1)),
      h: clamp(h, 0.04, 1 - clamp(y, 0, 1)),
    });
  }

  function onPointerUp() {
    drag.current = null;
  }

  const sel = {
    left: box.left + crop.x * box.width,
    top: box.top + crop.y * box.height,
    width: crop.w * box.width,
    height: crop.h * box.height,
  };

  return (
    <div
      ref={wrapRef}
      className="relative touch-none select-none overflow-hidden bg-ink/10"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt="Crop Vietnamese text"
        className="max-h-80 w-full object-contain"
        draggable={false}
        onLoad={measure}
      />
      {/* dim outside selection */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute bg-ink/45"
          style={{ left: 0, top: 0, right: 0, height: Math.max(0, sel.top) }}
        />
        <div
          className="absolute bg-ink/45"
          style={{
            left: 0,
            top: sel.top + sel.height,
            right: 0,
            bottom: 0,
          }}
        />
        <div
          className="absolute bg-ink/45"
          style={{
            left: 0,
            top: sel.top,
            width: Math.max(0, sel.left),
            height: sel.height,
          }}
        />
        <div
          className="absolute bg-ink/45"
          style={{
            left: sel.left + sel.width,
            top: sel.top,
            right: 0,
            height: sel.height,
          }}
        />
      </div>
      <div
        className="absolute border-2 border-coral shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
        style={{
          left: sel.left,
          top: sel.top,
          width: Math.max(8, sel.width),
          height: Math.max(8, sel.height),
        }}
      >
        {(["nw", "ne", "sw", "se"] as Corner[]).map((c) => (
          <span
            key={c}
            data-corner={c}
            className={`absolute h-4 w-4 rounded-full border-2 border-paper bg-coral ${
              c.includes("n") ? "-top-2" : "-bottom-2"
            } ${c.includes("w") ? "-left-2" : "-right-2"}`}
          />
        ))}
      </div>
    </div>
  );
}

export const DEFAULT_CROP: CropRect = { x: 0.08, y: 0.12, w: 0.84, h: 0.76 };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function insideCrop(x: number, y: number, crop: CropRect) {
  return x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;
}

function normRect(x0: number, y0: number, x1: number, y1: number): CropRect {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  return {
    x,
    y,
    w: Math.max(0.04, Math.abs(x1 - x0)),
    h: Math.max(0.04, Math.abs(y1 - y0)),
  };
}
