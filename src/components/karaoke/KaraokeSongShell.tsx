"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { BilingualKaraokePlayer } from "@/components/karaoke/BilingualKaraokePlayer";
import { LearnTheLyrics } from "@/components/karaoke/LearnTheLyrics";
import type { KaraokeSong } from "@/lib/karaoke/types";
import { getLearnLyricsProgress } from "@/lib/sing/learnLyrics/progress";

type Surface = "sing" | "learn";

type Props = {
  song: KaraokeSong;
};

/**
 * Top-level Sing | Learn switch for approved karaoke songs.
 * Learn uses real lyric lines only — never invents lyrics.
 */
export function KaraokeSongShell({ song }: Props) {
  const [surface, setSurface] = useState<Surface>(() => {
    if (typeof window === "undefined") return "sing";
    const p = getLearnLyricsProgress(song.id);
    return p.lastLineId || p.completedLineIds.length ? "learn" : "sing";
  });
  const [singSeekSec, setSingSeekSec] = useState<number | null>(null);
  const [singSeekNonce, setSingSeekNonce] = useState(0);

  function returnToSing(audioSec: number) {
    setSingSeekSec(audioSec);
    setSingSeekNonce((n) => n + 1);
    setSurface("sing");
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Link href="/sing" className="text-sm text-coral underline-offset-2 hover:underline">
          Library
        </Link>
      </div>
      <p className="quiet-label mt-5">ÁMi Sing</p>
      <h1 className="mt-1 font-display text-2xl text-ink" lang="vi">
        {song.title}
      </h1>
      <p className="text-sm text-ink/55">{song.artist}</p>

      <div className="mt-4 grid grid-cols-2 gap-2" role="tablist" aria-label="Song surface">
        <button
          type="button"
          role="tab"
          aria-selected={surface === "sing"}
          className={`rounded-2xl px-3 py-3 text-sm font-medium ${
            surface === "sing" ? "bg-coral text-paper shadow-soft" : "bg-soft text-ink/70"
          }`}
          onClick={() => setSurface("sing")}
        >
          Sing
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={surface === "learn"}
          className={`rounded-2xl px-3 py-3 text-sm font-medium ${
            surface === "learn" ? "bg-coral text-paper shadow-soft" : "bg-soft text-ink/70"
          }`}
          onClick={() => setSurface("learn")}
        >
          Learn
        </button>
      </div>
      <p className="mt-2 text-xs text-ink/45">
        {surface === "sing"
          ? "Karaoke with progressive word fill — Learn / Sing / Practice inside."
          : "Sentence-by-sentence study from the real lyrics — tap words, Đánh Vần, record."}
      </p>

      {surface === "sing" ? (
        <BilingualKaraokePlayer
          song={song}
          initialSeekSec={singSeekSec}
          seekNonce={singSeekNonce}
        />
      ) : (
        <LearnTheLyrics song={song} onReturnToSing={returnToSing} />
      )}

      <p className="mt-6 text-[11px] leading-relaxed text-ink/35">
        Preprocessed approved timings — lyrics are not invented.{" "}
        <Link
          href={`/sing/admin/align/${song.id}`}
          className="text-coral underline-offset-2 hover:underline"
        >
          Admin alignment
        </Link>
      </p>
      <Link href="/sing" className="teacher-btn-secondary mt-4 w-full text-center">
        Back to library
      </Link>
    </div>
  );
}
