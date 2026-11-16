"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { browserStore } from "@/lib/experience/store";
import { ENGLISH_KARAOKE_MODES } from "@/lib/english/karaokeModes";
import { loadEnglishKaraoke, type EnglishKaraokeState } from "@/lib/english/karaokeProgress";
import { ENGLISH_SONGS, ENGLISH_SONG_TOPICS, type EnglishSongTopic } from "@/lib/english/song";
import { EnShell } from "./EnShell";

export function EnglishSing() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<EnglishSongTopic | "all">("all");
  const [state, setState] = useState<EnglishKaraokeState>({ savedIds: [], modes: {} });

  useEffect(() => {
    setState(loadEnglishKaraoke(browserStore()));
  }, []);

  const songs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENGLISH_SONGS.filter((song) => {
      if (topic !== "all" && song.topic !== topic) return false;
      if (!q) return true;
      return `${song.titleEn} ${song.titleVi} ${song.summaryVi}`.toLowerCase().includes(q);
    });
  }, [query, topic]);

  const continued = ENGLISH_SONGS.filter((song) => (state.modes[song.id]?.length ?? 0) > 0);

  return (
    <EnShell title="Hát karaoke" backHref="/en" backLabel="Về trang học">
      <p className="text-lg">Học tiếng Anh qua bài hát gốc. Cùng năm cách như lớp hát tiếng Việt.</p>
      <p className="mt-2 text-base">
        {ENGLISH_KARAOKE_MODES.map((mode) => mode.label).join(" · ")}
      </p>
      <p className="mt-3 text-base">Không dùng bài có bản quyền. Chưa có nhạc đệm, nên chưa khớp từng từ với nhạc.</p>

      <label className="mt-5 block text-base font-semibold" htmlFor="en-song-search">
        Tìm bài
      </label>
      <input
        id="en-song-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="hello, cà phê, gia đình…"
        className="en-panel mt-2 w-full px-4 py-3 text-lg"
      />

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Chủ đề">
        {ENGLISH_SONG_TOPICS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={topic === item.id ? "en-btn en-btn-primary px-4" : "en-btn en-btn-secondary px-4"}
            aria-pressed={topic === item.id}
            onClick={() => setTopic(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {continued.length > 0 && topic === "all" && !query.trim() ? (
        <section className="mt-6">
          <h2 className="font-display text-2xl">Tiếp tục</h2>
          <ul className="mt-3 space-y-3">
            {continued.map((song) => (
              <SongCard key={song.id} songId={song.id} done={state.modes[song.id]?.length ?? 0} saved={state.savedIds.includes(song.id)} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-display text-2xl">Bài cho người mới</h2>
        {songs.length === 0 ? <p className="mt-3 text-lg">Không có bài khớp.</p> : null}
        <ul className="mt-3 space-y-3">
          {songs.map((song) => (
            <SongCard key={song.id} songId={song.id} done={state.modes[song.id]?.length ?? 0} saved={state.savedIds.includes(song.id)} />
          ))}
        </ul>
      </section>
    </EnShell>
  );
}

function SongCard({ songId, done, saved }: { songId: string; done: number; saved: boolean }) {
  const song = ENGLISH_SONGS.find((item) => item.id === songId);
  if (!song) return null;
  return (
    <li>
      <Link href={`/en/sing/${song.id}`} className="en-panel block px-4 py-4">
        <p className="text-sm font-semibold text-[var(--en-leaf)]">
          {ENGLISH_SONG_TOPICS.find((item) => item.id === song.topic)?.label}
          {saved ? " · Đã lưu" : ""}
          {done ? ` · ${done}/${ENGLISH_KARAOKE_MODES.length} phần` : ""}
        </p>
        <p className="mt-1 font-display text-2xl" lang="en">
          {song.titleEn}
        </p>
        <p className="text-lg">{song.titleVi}</p>
        <p className="mt-1 text-base">{song.summaryVi}</p>
      </Link>
    </li>
  );
}
