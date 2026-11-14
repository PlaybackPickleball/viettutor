"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { BilingualKaraokePlayer } from "@/components/karaoke/BilingualKaraokePlayer";
import { KaraokePlayer, formatKaraokeTime } from "@/components/KaraokePlayer";
import {
  getFixtureKaraokeSong,
  getKaraokeSong,
  registerKaraokeOverride,
} from "@/lib/karaoke/catalog";
import { describePipeline, flagUncertainTokens } from "@/lib/karaoke/pipeline";
import type { KaraokeSong, LyricToken } from "@/lib/karaoke/types";
import { msToSec, secToMs } from "@/lib/karaoke/types";

const DRAFT_KEY = "ami-lingua.karaoke-align-draft.v1";

function loadDraft(songId: string): KaraokeSong | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Record<string, KaraokeSong>;
    return all[songId] ?? null;
  } catch {
    return null;
  }
}

function saveDraftLocal(song: KaraokeSong) {
  const all = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Record<string, KaraokeSong>;
  all[song.id] = song;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
}

export function AlignAdminClient({ songId }: { songId: string }) {
  const fixture = useMemo(() => getFixtureKaraokeSong(songId), [songId]);
  const [song, setSong] = useState<KaraokeSong | null>(() =>
    fixture ? structuredClone(fixture) : getKaraokeSong(songId) ?? null,
  );
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(fixture?.title ?? songId);
  const [artist, setArtist] = useState(fixture?.artist ?? "");
  const [lyricsVi, setLyricsVi] = useState(
    () => fixture?.lines.map((l) => l.textVi).join("\n") ?? "",
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isolateVocals, setIsolateVocals] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [tSec, setTSec] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [seekNonce, setSeekNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadDraft(songId);
      try {
        const res = await fetch(`/api/sing/karaoke/${songId}`);
        if (res.ok) {
          const data = (await res.json()) as { song?: KaraokeSong };
          if (!cancelled && data.song) {
            const next = local ?? data.song;
            setSong(next);
            setTitle(next.title);
            setArtist(next.artist);
            if (!local) {
              setLyricsVi(next.lines.map((l) => l.textVi).join("\n"));
            }
            return;
          }
        }
      } catch {
        /* */
      }
      if (!cancelled && local) setSong(local);
    })();
    return () => {
      cancelled = true;
    };
  }, [songId]);

  const selected: LyricToken | null = useMemo(() => {
    if (!song || !tokenId) return null;
    return song.lines.flatMap((l) => l.tokens).find((t) => t.id === tokenId) ?? null;
  }, [song, tokenId]);

  const tMs = song ? secToMs(tSec) - (song.globalOffsetMs ?? 0) : 0;

  const patchSong = useCallback((updater: (prev: KaraokeSong) => KaraokeSong) => {
    setSong((prev) => (prev ? updater(prev) : prev));
  }, []);

  function updateSelected(patch: Partial<LyricToken>) {
    if (!selected) return;
    patchSong((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => ({
        ...l,
        tokens: l.tokens.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)),
        startMs:
          l.id === selected.lineId && (patch.startMs != null || patch.endMs != null)
            ? Math.min(
                ...l.tokens.map((t) =>
                  t.id === selected.id ? (patch.startMs ?? t.startMs) : t.startMs,
                ),
              )
            : l.startMs,
        endMs:
          l.id === selected.lineId && (patch.startMs != null || patch.endMs != null)
            ? Math.max(
                ...l.tokens.map((t) =>
                  t.id === selected.id ? (patch.endMs ?? t.endMs) : t.endMs,
                ),
              )
            : l.endMs,
      })),
    }));
  }

  function nudgeOffset(delta: number) {
    patchSong((prev) => ({
      ...prev,
      globalOffsetMs: (prev.globalOffsetMs ?? 0) + delta,
    }));
  }

  function markTokenBoundary(which: "start" | "end") {
    if (!selected || !song) return;
    const ms = secToMs(tSec) - (song.globalOffsetMs ?? 0);
    if (which === "start") {
      updateSelected({ startMs: Math.max(0, ms) });
    } else {
      updateSelected({ endMs: Math.max((selected.startMs ?? 0) + 40, ms) });
    }
  }

  async function runAlignment() {
    setBusy(true);
    setStatus("Running Demucs + forced alignment (may take several minutes on CPU)…");
    try {
      const form = new FormData();
      form.set("songId", songId);
      form.set("title", title);
      form.set("artist", artist);
      form.set("lyricsVi", lyricsVi);
      form.set("isolateVocals", isolateVocals ? "1" : "0");
      if (audioFile) form.set("audio", audioFile);
      const res = await fetch("/api/sing/align", { method: "POST", body: form });
      const data = (await res.json()) as {
        ok?: boolean;
        song?: KaraokeSong;
        error?: string;
        logTail?: string;
        message?: string;
      };
      if (!res.ok || !data.song) {
        setStatus(data.message || data.error || data.logTail || "Alignment failed");
        return;
      }
      setSong(data.song);
      saveDraftLocal(data.song);
      setStatus(
        `Aligned ${data.song.lines.length} lines / ${data.song.lines.reduce((n, l) => n + l.tokens.length, 0)} words. Review timings, then Approve.`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function persist(approve: boolean) {
    if (!song) return;
    setBusy(true);
    try {
      const payload: KaraokeSong = {
        ...song,
        title,
        artist,
        publishStatus: approve ? "approved" : song.publishStatus,
        reviews: flagUncertainTokens(song),
      };
      const res = await fetch(`/api/sing/karaoke/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: payload, approve }),
      });
      const data = (await res.json()) as { ok?: boolean; song?: KaraokeSong; error?: string };
      if (!res.ok || !data.song) {
        setStatus(data.error || "Save failed");
        return;
      }
      setSong(data.song);
      saveDraftLocal(data.song);
      if (approve) registerKaraokeOverride(data.song);
      setStatus(approve ? "Approved timestamps saved (process once)." : "Draft saved to server.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!song) {
    return (
      <div className="studio-shell">
        <BrandMark />
        <p className="mt-6 text-sm text-ink/55">
          No karaoke document yet for <code>{songId}</code>. Upload audio, paste verified lyrics, and
          run forced alignment below.
        </p>
        <SyncIngest
          songId={songId}
          title={title}
          artist={artist}
          lyricsVi={lyricsVi}
          isolateVocals={isolateVocals}
          busy={busy}
          status={status}
          onTitle={setTitle}
          onArtist={setArtist}
          onLyrics={setLyricsVi}
          onIsolate={setIsolateVocals}
          onFile={setAudioFile}
          onRun={() => void runAlignment()}
        />
        <Link href="/sing/admin" className="teacher-btn-secondary mt-6 w-full text-center">
          Back to admin
        </Link>
      </div>
    );
  }

  const uncertain = flagUncertainTokens(song);
  const durationSec = msToSec(song.durationMs);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Link href="/sing/admin" className="text-sm text-coral underline-offset-2 hover:underline">
          Admin
        </Link>
      </div>
      <p className="quiet-label mt-5">Song administration</p>
      <h1 className="mt-1 font-display text-2xl text-ink">Synchronization editor</h1>
      <p className="mt-2 text-sm text-ink/55">
        Demucs vocal isolation + Vietnamese forced alignment. Playback clock is{" "}
        <code>audio.currentTime</code> minus global offset. Edit individual word ms while listening.
      </p>

      <SyncIngest
        songId={songId}
        title={title}
        artist={artist}
        lyricsVi={lyricsVi}
        isolateVocals={isolateVocals}
        busy={busy}
        status={status}
        onTitle={setTitle}
        onArtist={setArtist}
        onLyrics={setLyricsVi}
        onIsolate={setIsolateVocals}
        onFile={setAudioFile}
        onRun={() => void runAlignment()}
      />

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Pipeline</p>
        <ul className="mt-2 space-y-1 text-xs text-ink/55">
          {describePipeline().map((s) => (
            <li key={s.step}>
              <span className="font-medium text-ink/70">{s.step}</span> · {s.provider}
            </li>
          ))}
        </ul>
        {uncertain.length ? (
          <p className="mt-2 text-xs text-coral">
            {uncertain.length} token(s) flagged for timing review.
          </p>
        ) : (
          <p className="mt-2 text-xs text-ink/40">No low-confidence timing flags.</p>
        )}
        <p className="mt-1 text-xs text-ink/40">
          pipeline: {song.pipelineVersion ?? "—"} · offset {song.globalOffsetMs ?? 0} ms ·{" "}
          {song.publishStatus}
        </p>
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Transport + global offset</p>
        <KaraokePlayer
          trackId={`${song.id}-admin`}
          audioUrl={song.audioUrl}
          durationSec={durationSec}
          playing={playing}
          speed={1}
          loop={null}
          seekTo={seekTo}
          seekNonce={seekNonce}
          onTime={setTSec}
          onPlayingChange={setPlaying}
        />
        <div className="mt-3 flex items-center justify-center gap-3">
          <button type="button" className="circle-btn" onClick={() => setPlaying((p) => !p)}>
            {playing ? "❚❚" : "▶"}
          </button>
          <span className="text-sm text-ink/55">
            {formatKaraokeTime(tSec)} / {formatKaraokeTime(durationSec)} · lyric clock{" "}
            {formatKaraokeTime(Math.max(0, tMs / 1000))}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={durationSec}
          step={0.05}
          value={tSec}
          onChange={(e) => {
            const v = Number(e.target.value);
            setSeekTo(v);
            setSeekNonce((n) => n + 1);
            setTSec(v);
          }}
          className="mt-3 w-full accent-[var(--coral)]"
        />
        <label className="quiet-label mt-4 block">
          Global offset (ms) — positive delays lyric highlight vs audio
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className="teacher-btn-secondary px-3 py-2 text-sm" onClick={() => nudgeOffset(-100)}>
            −100
          </button>
          <button type="button" className="teacher-btn-secondary px-3 py-2 text-sm" onClick={() => nudgeOffset(-20)}>
            −20
          </button>
          <input
            type="number"
            className="ami-card w-28 px-3 py-2 text-sm"
            value={song.globalOffsetMs ?? 0}
            onChange={(e) =>
              patchSong((prev) => ({
                ...prev,
                globalOffsetMs: Number(e.target.value) || 0,
              }))
            }
          />
          <button type="button" className="teacher-btn-secondary px-3 py-2 text-sm" onClick={() => nudgeOffset(20)}>
            +20
          </button>
          <button type="button" className="teacher-btn-secondary px-3 py-2 text-sm" onClick={() => nudgeOffset(100)}>
            +100
          </button>
        </div>
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Word timestamps</p>
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto text-sm">
          {song.lines.flatMap((l) =>
            l.tokens.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-2 py-1.5 text-left ${
                    tokenId === t.id ? "bg-coral/15" : "hover:bg-soft"
                  }`}
                  onClick={() => {
                    setTokenId(t.id);
                    const sec = msToSec(t.startMs + (song.globalOffsetMs ?? 0));
                    setSeekTo(sec);
                    setSeekNonce((n) => n + 1);
                    setTSec(sec);
                  }}
                  lang="vi"
                >
                  {t.text}{" "}
                  <span className="text-xs text-ink/40">
                    {t.startMs}–{t.endMs} ms · {t.contextualEnglish}
                  </span>
                </button>
              </li>
            )),
          )}
        </ul>

        {selected ? (
          <div className="mt-4 space-y-2 border-t border-[#e8d9c8] pt-3">
            <p className="font-display text-xl text-ink" lang="vi">
              {selected.text}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="teacher-btn-secondary py-2 text-sm"
                onClick={() => markTokenBoundary("start")}
              >
                Set start @ playhead
              </button>
              <button
                type="button"
                className="teacher-btn-secondary py-2 text-sm"
                onClick={() => markTokenBoundary("end")}
              >
                Set end @ playhead
              </button>
            </div>
            <label className="quiet-label block">Start ms</label>
            <input
              type="number"
              className="ami-card w-full px-3 py-2 text-sm"
              value={selected.startMs}
              onChange={(e) => updateSelected({ startMs: Number(e.target.value) || 0 })}
            />
            <label className="quiet-label block">End ms</label>
            <input
              type="number"
              className="ami-card w-full px-3 py-2 text-sm"
              value={selected.endMs}
              onChange={(e) => updateSelected({ endMs: Number(e.target.value) || 0 })}
            />
            <label className="quiet-label block">Contextual English</label>
            <input
              className="ami-card w-full px-3 py-2 text-sm"
              value={selected.contextualEnglish}
              onChange={(e) => updateSelected({ contextualEnglish: e.target.value })}
            />
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="teacher-btn-secondary w-full"
            disabled={busy}
            onClick={() => {
              saveDraftLocal(song);
              void persist(false);
            }}
          >
            Save draft (server + this device)
          </button>
          <button
            type="button"
            className="teacher-btn-primary w-full"
            disabled={busy}
            onClick={() => void persist(true)}
          >
            Approve timestamps
          </button>
        </div>
      </section>

      <p className="quiet-label mt-6">Learner preview</p>
      <BilingualKaraokePlayer song={song} />

      <Link href={`/sing/${song.id}`} className="teacher-btn-secondary mt-6 w-full text-center">
        Open learner player
      </Link>
    </div>
  );
}

function SyncIngest(props: {
  songId: string;
  title: string;
  artist: string;
  lyricsVi: string;
  isolateVocals: boolean;
  busy: boolean;
  status: string | null;
  onTitle: (v: string) => void;
  onArtist: (v: string) => void;
  onLyrics: (v: string) => void;
  onIsolate: (v: boolean) => void;
  onFile: (f: File | null) => void;
  onRun: () => void;
}) {
  return (
    <section className="ami-card mt-5 px-4 py-4">
      <p className="quiet-label">Upload + verified lyrics</p>
      <label className="quiet-label mt-3 block">Title</label>
      <input
        className="ami-card mt-1 w-full px-3 py-2 text-sm"
        value={props.title}
        onChange={(e) => props.onTitle(e.target.value)}
      />
      <label className="quiet-label mt-3 block">Artist</label>
      <input
        className="ami-card mt-1 w-full px-3 py-2 text-sm"
        value={props.artist}
        onChange={(e) => props.onArtist(e.target.value)}
      />
      <label className="quiet-label mt-3 block">Audio (MP3 / WAV) — optional if catalog master exists</label>
      <input
        type="file"
        accept="audio/mpeg,audio/wav,audio/mp4,audio/ogg,.mp3,.wav,.m4a,.ogg"
        className="mt-1 block w-full text-sm"
        onChange={(e) => props.onFile(e.target.files?.[0] ?? null)}
      />
      <label className="quiet-label mt-3 block">Verified Vietnamese lyrics (one line per row)</label>
      <textarea
        className="ami-card mt-1 min-h-40 w-full px-3 py-2 text-sm"
        lang="vi"
        value={props.lyricsVi}
        onChange={(e) => props.onLyrics(e.target.value)}
        placeholder="Paste exact lyrics…"
      />
      <label className="mt-3 flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={props.isolateVocals}
          onChange={(e) => props.onIsolate(e.target.checked)}
        />
        Isolate vocals with Demucs before align
      </label>
      <button
        type="button"
        className="teacher-btn-primary mt-4 w-full"
        disabled={props.busy || !props.lyricsVi.trim()}
        onClick={props.onRun}
      >
        {props.busy ? "Aligning…" : "Run forced alignment"}
      </button>
      {props.status ? <p className="mt-2 whitespace-pre-wrap text-xs text-ink/55">{props.status}</p> : null}
      <p className="mt-2 text-[11px] text-ink/40">Song id: {props.songId}</p>
    </section>
  );
}
