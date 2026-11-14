"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { searchSongs } from "@/lib/sing/catalog";
import { loadSingProgress } from "@/lib/sing/progress";
import type { SingProgress } from "@/lib/sing/types";

export function SingLibraryClient() {
  const [q, setQ] = useState("");
  const [progress, setProgress] = useState<Record<string, SingProgress>>({});
  const songs = useMemo(() => searchSongs(q), [q]);

  useEffect(() => {
    setProgress(loadSingProgress());
  }, []);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl text-ink">ÁMi Sing</h1>
      <p className="mt-2 text-ink/60">
        Learn Vietnamese through karaoke — listen, sing along, then speak the words clearly.
      </p>

      <label className="quiet-label mt-6 block" htmlFor="sing-search">
        Search songs
      </label>
      <input
        id="sing-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="greetings, beginner, hello…"
        className="ami-card mt-2 w-full px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-coral/40"
      />

      <ul className="mt-5 space-y-3">
        {songs.map((song) => {
          const p = progress[song.id];
          return (
            <li key={song.id}>
              <Link
                href={`/sing/${song.id}`}
                className="ami-card block px-4 py-4 transition hover:bg-paper"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="quiet-label">{song.level}</p>
                    <p className="mt-1 font-display text-xl text-ink" lang="vi">
                      {song.title}
                    </p>
                    <p className="text-sm text-ink/55">{song.titleEn}</p>
                    <p className="mt-2 text-sm text-ink/60">{song.summary}</p>
                    <p className="mt-2 text-xs text-ink/40">
                      {song.artist} · {song.durationSec}s · authorized original
                    </p>
                  </div>
                  <span className="rounded-full bg-coral/15 px-2.5 py-1 text-xs text-coral">
                    {p?.modesCompleted?.length ? `${p.modesCompleted.length}/3 modes` : "New"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        {songs.length === 0 ? (
          <li className="text-sm text-ink/50">No songs match that search yet.</li>
        ) : null}
      </ul>

      <p className="mt-8 text-xs leading-relaxed text-ink/40">
        Library uses original or licensed tracks only — never auto-imported YouTube songs. Pitch
        while singing is not used as a pronunciation score (tones change in music).
      </p>

      <Link href="/" className="teacher-btn-secondary mt-6 w-full text-center">
        Back home
      </Link>
    </div>
  );
}
