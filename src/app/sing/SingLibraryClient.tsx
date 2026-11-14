"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { formatLessonDuration, listCatalogSongs, searchSongs } from "@/lib/sing/catalog";
import {
  loadPracticeHistory,
  loadSavedSongIds,
  loadSingProgress,
  MODE_COUNT,
} from "@/lib/sing/progress";
import { availabilityLabel, canPlayAudio } from "@/lib/sing/rights";
import type {
  Difficulty,
  PracticeHistoryEntry,
  SingProgress,
  SingSong,
  VocalType,
} from "@/lib/sing/types";

type Filters = {
  difficulty: Difficulty | "all";
  vocal: VocalType | "all";
  style: string;
  topic: string;
  dialect: string;
};

const EMPTY_FILTERS: Filters = {
  difficulty: "all",
  vocal: "all",
  style: "all",
  topic: "",
  dialect: "all",
};

function SongCard({
  song,
  progress,
  saved,
}: {
  song: SingSong;
  progress?: SingProgress;
  saved?: boolean;
}) {
  const ready = canPlayAudio(song);
  const href = `/sing/${song.id}`;
  return (
    <li>
      <Link href={href} className="ami-card block px-4 py-4 transition hover:bg-paper">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="quiet-label">
              {song.difficulty} · {song.vocalType} · {song.category}
            </p>
            <p className="mt-1 font-display text-xl text-ink" lang="vi">
              {song.title}
            </p>
            <p className="text-sm text-ink/55">
              {song.artist}
              {song.songwriter ? ` · ${song.songwriter}` : ""}
            </p>
            <p className="mt-2 text-sm text-ink/60">{song.summary}</p>
            <p className="mt-2 text-xs text-ink/40">
              {formatLessonDuration(song)}
              {saved ? " · Saved" : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs ${
                ready ? "bg-coral/15 text-coral" : "bg-soft text-ink/50"
              }`}
            >
              {availabilityLabel(song)}
            </span>
            {progress?.modesCompleted?.length ? (
              <span className="text-[11px] text-ink/40">
                {progress.modesCompleted.length}/{MODE_COUNT} modes
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Section({
  title,
  songs,
  progress,
  savedIds,
}: {
  title: string;
  songs: SingSong[];
  progress: Record<string, SingProgress>;
  savedIds: string[];
}) {
  if (!songs.length) return null;
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <ul className="mt-3 space-y-3">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            progress={progress[song.id]}
            saved={savedIds.includes(song.id)}
          />
        ))}
      </ul>
    </section>
  );
}

export function SingLibraryClient() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [progress, setProgress] = useState<Record<string, SingProgress>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);

  useEffect(() => {
    setProgress(loadSingProgress());
    setSavedIds(loadSavedSongIds());
    setHistory(loadPracticeHistory());
  }, []);

  const filtered = useMemo(() => {
    let songs = searchSongs(q);
    if (filters.difficulty !== "all") {
      songs = songs.filter((s) => s.difficulty === filters.difficulty);
    }
    if (filters.vocal !== "all") {
      songs = songs.filter((s) => s.vocalType === filters.vocal);
    }
    if (filters.style !== "all") {
      songs = songs.filter((s) => s.style === filters.style);
    }
    if (filters.dialect !== "all") {
      songs = songs.filter((s) => s.dialect === filters.dialect);
    }
    if (filters.topic.trim()) {
      const t = filters.topic.trim().toLowerCase();
      songs = songs.filter((s) =>
        [...s.tags, ...s.skills, s.genre].join(" ").toLowerCase().includes(t),
      );
    }
    return songs;
  }, [q, filters]);

  const all = listCatalogSongs();
  const continueSongs = all.filter((s) => progress[s.id]?.modesCompleted?.length);
  const featured = filtered.filter((s) => s.featured);
  const beginner = filtered.filter(
    (s) => s.difficulty === "beginner" || s.category === "Beginner Songs",
  );
  const male = filtered.filter((s) => s.vocalType === "male");
  const female = filtered.filter((s) => s.vocalType === "female");
  const saved = filtered.filter((s) => savedIds.includes(s.id));

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Link href="/sing/admin" className="text-sm text-ink/45 underline-offset-2 hover:underline">
          Admin
        </Link>
      </div>

      <h1 className="mt-6 font-display text-3xl text-ink">ÁMi Sing</h1>
      <p className="mt-2 text-ink/60">Learn Vietnamese Through Music</p>

      <label className="quiet-label mt-6 block" htmlFor="sing-search">
        Search songs
      </label>
      <input
        id="sing-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="greetings, ballad, Thành Đạt…"
        className="ami-card mt-2 w-full px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-coral/40"
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <select
          className="ami-card px-3 py-2 text-sm text-ink"
          value={filters.difficulty}
          onChange={(e) =>
            setFilters((f) => ({ ...f, difficulty: e.target.value as Filters["difficulty"] }))
          }
          aria-label="Difficulty"
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="elementary">Elementary</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          className="ami-card px-3 py-2 text-sm text-ink"
          value={filters.vocal}
          onChange={(e) =>
            setFilters((f) => ({ ...f, vocal: e.target.value as Filters["vocal"] }))
          }
          aria-label="Vocal type"
        >
          <option value="all">All vocals</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="mixed">Mixed</option>
        </select>
        <select
          className="ami-card px-3 py-2 text-sm text-ink"
          value={filters.style}
          onChange={(e) => setFilters((f) => ({ ...f, style: e.target.value }))}
          aria-label="Music style"
        >
          <option value="all">All styles</option>
          <option value="educational">Educational</option>
          <option value="ballad">Ballad</option>
          <option value="acoustic-pop">Acoustic pop</option>
          <option value="folk">Folk</option>
        </select>
        <select
          className="ami-card px-3 py-2 text-sm text-ink"
          value={filters.dialect}
          onChange={(e) => setFilters((f) => ({ ...f, dialect: e.target.value }))}
          aria-label="Dialect"
        >
          <option value="all">All dialects</option>
          <option value="southern">Southern</option>
          <option value="northern">Northern</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>
      <input
        value={filters.topic}
        onChange={(e) => setFilters((f) => ({ ...f, topic: e.target.value }))}
        placeholder="Learning topic (greetings, emotion…)"
        className="ami-card mt-2 w-full px-4 py-2.5 text-sm text-ink outline-none"
        aria-label="Learning topic"
      />

      <Section title="Continue Learning" songs={continueSongs} progress={progress} savedIds={savedIds} />
      <Section title="Featured Songs" songs={featured} progress={progress} savedIds={savedIds} />
      <Section title="Beginner Songs" songs={beginner} progress={progress} savedIds={savedIds} />
      <Section title="Male Vocals" songs={male} progress={progress} savedIds={savedIds} />
      <Section title="Female Vocals" songs={female} progress={progress} savedIds={savedIds} />
      <Section title="My Saved Songs" songs={saved} progress={progress} savedIds={savedIds} />

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Practice History</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-ink/45">Practice a song to see history here.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.slice(0, 8).map((h) => (
              <li key={h.id} className="text-sm text-ink/60">
                <Link href={`/sing/${h.songId}`} className="text-coral underline-offset-2 hover:underline">
                  {h.songTitle}
                </Link>
                {" · "}
                {h.mode} · {new Date(h.at).toLocaleString("en-GB", { timeZone: "Asia/Saigon" })}{" "}
                (Asia/Saigon)
              </li>
            ))}
          </ul>
        )}
      </section>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50">No songs match those filters yet.</p>
      ) : null}

      <p className="mt-8 text-xs leading-relaxed text-ink/40">
        Commercial titles appear as catalog cards with rights status{" "}
        <code className="text-ink/50">pending</code> until clearance. We never host unlicensed audio
        or lyrics. Singing pitch is never used as a pronunciation score.
      </p>

      <Link href="/" className="teacher-btn-secondary mt-6 w-full text-center">
        Back home
      </Link>
    </div>
  );
}
