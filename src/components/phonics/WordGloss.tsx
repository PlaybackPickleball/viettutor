"use client";

import { WordArt } from "@/components/phonics/WordArt";
import { resolveWordArt } from "@/lib/phonics/wordArt";

type Size = "sm" | "md" | "lg";

type Props = {
  /** Vietnamese written form (drives art lookup). */
  vi?: string | null;
  /** English gloss shown with matching art. */
  en?: string | null;
  size?: Size;
  /**
   * stacked: VI → illustration → EN (image bridges both).
   * inline: illustration beside VI+EN text.
   */
  stacked?: boolean;
  className?: string;
  viClassName?: string;
  enClassName?: string;
  hideVi?: boolean;
};

/**
 * Practice word + cream/coral illustration + EN gloss.
 * The same image is the memory link for both the Vietnamese form and its English.
 */
export function WordGloss({
  vi,
  en,
  size = "md",
  stacked = true,
  className = "",
  viClassName = "",
  enClassName = "",
  hideVi = false,
}: Props) {
  const art = resolveWordArt(vi);
  if (!vi && !en) return null;

  if (!art) {
    return (
      <div className={className}>
        {!hideVi && vi ? (
          <p className={viClassName} lang="vi">
            {vi}
          </p>
        ) : null}
        {en ? (
          <p className={enClassName} lang="en">
            {en}
          </p>
        ) : null}
      </div>
    );
  }

  if (!stacked) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <WordArt artId={art.artId} kind={art.kind} alt={art.alt} size={size} />
        <div className="min-w-0 text-left">
          {!hideVi && vi ? (
            <p className={viClassName} lang="vi">
              {vi}
            </p>
          ) : null}
          {en ? (
            <p className={enClassName} lang="en">
              {en}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {!hideVi && vi ? (
        <p className={viClassName} lang="vi">
          {vi}
        </p>
      ) : null}
      <WordArt artId={art.artId} kind={art.kind} alt={art.alt} size={size} />
      {en ? (
        <p className={enClassName} lang="en">
          {en}
        </p>
      ) : null}
      {art.kind === "training" ? (
        <p className="text-[10px] uppercase tracking-wide text-ink/35">Sound training</p>
      ) : null}
    </div>
  );
}
