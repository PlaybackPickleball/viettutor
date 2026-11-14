"use client";

import { useEffect, useRef } from "react";
import { KaraokeWord } from "@/components/karaoke/KaraokeWord";
import { phraseGlosses } from "@/lib/karaoke/engine";
import type { KaraokeMode, KaraokeSong, LyricLine, LyricToken } from "@/lib/karaoke/types";
import { findLineAtMs, findTokenAtMs } from "@/lib/karaoke/engine";

type Props = {
  song: KaraokeSong;
  currentMs: number;
  mode: KaraokeMode;
  selectedId: string | null;
  onTapToken: (token: LyricToken) => void;
  /** Practice: AI reads the full lyric phrase (not a single word). */
  onHearPhrase?: (line: LyricLine) => void;
};

export function BilingualKaraokeStage({
  song,
  currentMs,
  mode,
  selectedId,
  onTapToken,
  onHearPhrase,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeLine = findLineAtMs(song.lines, currentMs) ?? song.lines[0] ?? null;
  const activeTok = findTokenAtMs(song.lines, currentMs);

  useEffect(() => {
    if (!activeLine) return;
    const el = scrollerRef.current?.querySelector(`[data-line-id="${activeLine.id}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLine?.id]);

  const showGloss = mode === "learn";
  const showLineTranslation = mode !== "sing";

  return (
    <div
      ref={scrollerRef}
      className="ami-card max-h-[min(52vh,28rem)] overflow-y-auto scroll-smooth px-3 py-4"
    >
      <ul className="space-y-6">
        {song.lines.map((line) => {
          const isActive = activeLine?.id === line.id;
          const glosses = phraseGlosses(line);
          const glossByToken = new Map<string, string>();
          for (const g of glosses) {
            for (const id of g.tokenIds) glossByToken.set(id, g.textEn);
          }

          return (
            <li
              key={line.id}
              data-line-id={line.id}
              className={`rounded-2xl px-2 py-3 transition ${
                isActive ? "bg-coral/10" : "bg-transparent"
              }`}
            >
              <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-2" lang="vi">
                {line.tokens.map((tok) => (
                  <KaraokeWord
                    key={tok.id}
                    token={tok}
                    currentMs={isActive ? currentMs : tok.endMs < currentMs ? tok.endMs : tok.startMs}
                    showGloss={showGloss}
                    gloss={glossByToken.get(tok.id)}
                    selected={selectedId === tok.id}
                    onTap={onTapToken}
                  />
                ))}
              </div>
              {showLineTranslation ? (
                <p
                  className={`mt-2 text-center text-base leading-snug ${
                    isActive ? "text-ink/70" : "text-ink/40"
                  }`}
                >
                  {line.translationEn}
                </p>
              ) : null}
              {mode === "practice" && onHearPhrase ? (
                <button
                  type="button"
                  className={`mx-auto mt-2 block rounded-xl px-3 py-1.5 text-sm ${
                    isActive ? "bg-coral text-paper" : "bg-soft text-ink/70"
                  }`}
                  onClick={() => onHearPhrase(line)}
                >
                  Hear whole phrase (AI)
                </button>
              ) : null}
              {isActive && activeTok && mode === "learn" ? (
                <p className="mt-1 text-center text-[11px] text-ink/40">
                  Tone: {activeTok.token.toneMetadata.label}
                  {activeTok.token.toneMetadata.note
                    ? ` · ${activeTok.token.toneMetadata.note}`
                    : ""}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
