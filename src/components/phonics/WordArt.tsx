"use client";

import type { WordArtKind } from "@/lib/phonics/wordArt";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

type Props = {
  artId: string;
  kind: WordArtKind;
  alt: string;
  size?: Size;
  className?: string;
};

/** Cream/coral flat illustrations — adult-simple, not mascot-y. */
export function WordArt({ artId, kind, alt, size = "md", className = "" }: Props) {
  const ink = kind === "training" ? "#b08968" : "#3d2e24";
  const coral = "#e07a4a";
  const cream = "#f6efe6";
  const soft = "#f7efe4";
  const amber = "#e08a45";

  return (
    <figure
      className={`mx-auto flex items-center justify-center rounded-2xl bg-soft/90 ring-1 ring-coral/15 ${SIZE_CLASS[size]} ${className}`}
      aria-label={alt}
    >
      <svg viewBox="0 0 64 64" className="h-[82%] w-[82%]" role="img" aria-hidden>
        <rect width="64" height="64" rx="14" fill={cream} opacity="0.35" />
        {renderArt(artId, { ink, coral, cream, soft, amber })}
      </svg>
    </figure>
  );
}

type Palette = { ink: string; coral: string; cream: string; soft: string; amber: string };

function renderArt(artId: string, p: Palette) {
  switch (artId) {
    case "dad":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="22" r="8" fill={p.soft} />
          <path d="M18 52c2-12 10-18 14-18s12 6 14 18" />
          <path d="M24 30h16" stroke={p.coral} />
        </g>
      );
    case "mother":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="22" r="8" fill={p.soft} />
          <path d="M20 52c1-12 8-17 12-17s11 5 12 17" />
          <path d="M26 18c2-6 10-6 12 0" stroke={p.coral} />
        </g>
      );
    case "aunt":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="21" r="7.5" fill={p.soft} />
          <path d="M21 52c1-11 7-16 11-16s10 5 11 16" />
          <path d="M22 28h20" stroke={p.coral} />
          <circle cx="44" cy="18" r="2" fill={p.coral} stroke="none" />
        </g>
      );
    case "grandmother":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="23" r="8" fill={p.soft} />
          <path d="M19 52c2-11 9-16 13-16s11 5 13 16" />
          <path d="M24 18c3-5 13-5 16 0" stroke={p.amber} />
        </g>
      );
    case "sibling":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="24" r="7" fill={p.soft} />
          <path d="M22 50c1-9 6-13 10-13s9 4 10 13" />
          <path d="M28 34h8" stroke={p.coral} />
        </g>
      );
    case "brother":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="22" r="7.5" fill={p.soft} />
          <path d="M20 52c2-11 8-16 12-16s10 5 12 16" />
          <path d="M26 31h12" />
          <path d="M32 31v8" stroke={p.coral} />
        </g>
      );
    case "self":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="22" r="8" fill={p.soft} />
          <path d="M18 54c3-13 10-18 14-18s11 5 14 18" />
          <circle cx="32" cy="40" r="3" fill={p.coral} stroke="none" />
        </g>
      );
    case "house":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M12 30 L32 14 L52 30" stroke={p.coral} />
          <path d="M18 30v22h28V30" fill={p.soft} />
          <rect x="28" y="38" width="8" height="14" fill={p.cream} stroke={p.ink} />
        </g>
      );
    case "eat":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <ellipse cx="32" cy="36" rx="16" ry="8" fill={p.soft} />
          <path d="M16 36c0 10 8 16 16 16s16-6 16-16" />
          <path d="M24 22v10M28 20v12" stroke={p.coral} />
        </g>
      );
    case "study":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M14 20h36v28H14z" fill={p.soft} />
          <path d="M20 28h24M20 36h18M20 44h12" stroke={p.coral} />
        </g>
      );
    case "happy":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="32" cy="32" r="16" fill={p.soft} />
          <circle cx="26" cy="28" r="2" fill={p.ink} stroke="none" />
          <circle cx="38" cy="28" r="2" fill={p.ink} stroke="none" />
          <path d="M24 38c3 5 13 5 16 0" stroke={p.coral} />
        </g>
      );
    case "carry":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M20 28h24l-2 20H22z" fill={p.soft} />
          <path d="M26 28c0-8 12-8 12 0" stroke={p.coral} />
        </g>
      );
    case "listen":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M28 18c-8 4-12 12-12 18s4 12 8 14" fill={p.soft} />
          <path d="M36 24c6 3 10 8 10 14s-3 10-8 12" stroke={p.coral} />
          <circle cx="30" cy="34" r="3" fill={p.coral} stroke="none" />
        </g>
      );
    case "write":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 44 L40 22 l6 6 L24 50 H18z" fill={p.soft} />
          <path d="M36 26l6 6" stroke={p.coral} />
          <path d="M16 54h28" />
        </g>
      );
    case "leaf":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M32 50c-14-6-16-24-2-34 12 2 18 16 8 30z" fill={p.soft} />
          <path d="M32 50V22" stroke={p.coral} />
        </g>
      );
    case "fish":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="30" cy="32" rx="16" ry="10" fill={p.soft} />
          <path d="M46 32l10-8v16z" fill={p.coral} stroke={p.ink} />
          <circle cx="24" cy="30" r="2" fill={p.ink} stroke="none" />
        </g>
      );
    case "sing":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="24" cy="42" r="6" fill={p.soft} />
          <circle cx="40" cy="36" r="6" fill={p.soft} />
          <path d="M30 42V18l16-4v22" stroke={p.coral} />
        </g>
      );
    case "chicken":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="30" cy="30" r="12" fill={p.soft} />
          <path d="M40 26c6-2 10 2 8 8" stroke={p.coral} />
          <path d="M24 42l-4 10M34 42l4 10" />
          <circle cx="26" cy="28" r="1.8" fill={p.ink} stroke="none" />
        </g>
      );
    case "cow":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <ellipse cx="32" cy="34" rx="16" ry="11" fill={p.soft} />
          <circle cx="18" cy="26" r="7" fill={p.cream} />
          <path d="M14 20l-3-6M22 20l3-6" stroke={p.coral} />
          <circle cx="16" cy="25" r="1.5" fill={p.ink} stroke="none" />
          <path d="M24 44l-2 10M40 44l2 10" />
          <ellipse cx="38" cy="36" rx="3" ry="2.5" fill={p.coral} stroke="none" />
        </g>
      );
    case "scale":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M32 14v30" />
          <path d="M18 28h28" stroke={p.coral} />
          <path d="M18 28l-6 12h12zM46 28l-6 12h12z" fill={p.soft} />
        </g>
      );
    case "break":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M18 20h28v28H18z" fill={p.soft} />
          <path d="M28 20l4 10-6 6 8 12" stroke={p.coral} />
        </g>
      );
    case "gauge":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M16 40a16 16 0 0 1 32 0" fill={p.soft} />
          <path d="M32 40 L44 28" stroke={p.coral} />
          <circle cx="32" cy="40" r="3" fill={p.coral} stroke="none" />
        </g>
      );
    case "heart":
      return (
        <g fill={p.soft} stroke={p.coral} strokeWidth="2.2">
          <path d="M32 48s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20z" />
        </g>
      );
    case "dream":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M38 36a12 12 0 1 1-10-18 14 14 0 0 0 10 18z" fill={p.soft} stroke={p.coral} />
          <circle cx="18" cy="20" r="2" fill={p.amber} stroke="none" />
          <circle cx="48" cy="18" r="1.5" fill={p.amber} stroke="none" />
        </g>
      );
    case "word":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M14 18h28v20H14z" fill={p.soft} />
          <path d="M20 26h16M20 32h12" stroke={p.coral} />
          <path d="M42 28l8 6-8 6z" fill={p.coral} stroke={p.ink} />
        </g>
      );
    case "arrow":
      return (
        <g fill="none" stroke={p.coral} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 32h30" stroke={p.ink} />
          <path d="M36 22l12 10-12 10" />
        </g>
      );
    case "but":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 20c8 0 10 8 14 12s6 12 14 12" stroke={p.coral} />
          <circle cx="20" cy="20" r="3" fill={p.soft} />
          <circle cx="44" cy="44" r="3" fill={p.soft} />
        </g>
      );
    case "abstract-wave":
      return (
        <g fill="none" stroke={p.coral} strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
          <path d="M12 28c8-10 16 10 24 0s16 10 16 0" />
          <path d="M12 40c8-10 16 10 24 0s16 10 16 0" stroke={p.ink} opacity="0.45" />
        </g>
      );
    case "abstract-tone":
      return (
        <g fill="none" stroke={p.coral} strokeWidth="2.4" strokeLinecap="round">
          <path d="M20 44c4-20 12-28 24-28" />
          <path d="M28 20h16" stroke={p.ink} />
        </g>
      );
    case "abstract-dot":
      return (
        <g>
          <circle cx="32" cy="28" r="10" fill={p.soft} stroke={p.ink} strokeWidth="2.2" />
          <circle cx="32" cy="46" r="3.5" fill={p.coral} />
        </g>
      );
    case "abstract-circle":
      return (
        <g fill="none" stroke={p.ink} strokeWidth="2.2">
          <circle cx="32" cy="32" r="14" fill={p.soft} />
          <circle cx="32" cy="32" r="6" stroke={p.coral} />
        </g>
      );
    default:
      return (
        <g fill="none" stroke={p.coral} strokeWidth="2.2">
          <circle cx="32" cy="32" r="12" fill={p.soft} />
        </g>
      );
  }
}
