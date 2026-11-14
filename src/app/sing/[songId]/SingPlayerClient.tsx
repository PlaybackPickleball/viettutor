"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { KaraokePlayer, formatKaraokeTime } from "@/components/KaraokePlayer";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { LocalMp3Importer } from "@/components/LocalMp3Importer";
import { LyricTimingEditor } from "@/components/LyricTimingEditor";
import { SingSpeakMic } from "@/components/SingSpeakMic";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import { getSong } from "@/lib/sing/catalog";
import { isLocalAssetSong, isSingDevMode } from "@/lib/sing/devMode";
import { getLocalLyrics, type LocalLyricDraft } from "@/lib/sing/localLyrics";
import {
  createLocalObjectUrl,
  getLocalMp3,
  probeAudioDuration,
  revokeLocalObjectUrl,
  saveLocalMp3,
  type LocalMp3Record,
} from "@/lib/sing/localMedia";
import { SING_MODES } from "@/lib/sing/modes";
import {
  bumpSingVocab,
  getSongProgress,
  loadSavedSongIds,
  markSingMode,
  pushPracticeHistory,
  saveSongFavorite,
} from "@/lib/sing/progress";
import {
  canPlayAudio,
  canRecordUgc,
  rightsAllowLyrics,
  rightsAllowPlayback,
} from "@/lib/sing/rights";
import { findLineAt, findTokenAt } from "@/lib/sing/timing";
import type { LyricLine, LyricToken, SingMode } from "@/lib/sing/types";
import type { ScoreResult } from "@/lib/pronunciation/types";
import { loadVocab, saveVocabItem } from "@/lib/vocab/store";

const SPEEDS = [0.75, 1, 1.25] as const;

export function SingPlayerClient({ songId }: { songId: string }) {
  const router = useRouter();
  const song = useMemo(() => getSong(songId), [songId]);

  const [mode, setMode] = useState<SingMode>("listen");
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [loop, setLoop] = useState<{ start: number; end: number } | null>(null);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [seekNonce, setSeekNonce] = useState(0);
  const [selected, setSelected] = useState<LyricToken | null>(null);
  const [focusLineId, setFocusLineId] = useState<string | null>(null);
  const [speakLineId, setSpeakLineId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [saved, setSaved] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [localRecord, setLocalRecord] = useState<LocalMp3Record | null>(null);
  const [lyricDraft, setLyricDraft] = useState<LocalLyricDraft | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [seedBusy, setSeedBusy] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [songVocab, setSongVocab] = useState<
    { expression: string; meaningEn: string; originalSentence?: string }[]
  >([]);

  useEffect(() => {
    if (!song) {
      router.replace("/sing");
      return;
    }
    setSaved(loadSavedSongIds().includes(song.id));
    setDurationSec(song.durationSec || 0);
    setDevMode(isSingDevMode());
    setLyricDraft(getLocalLyrics(song.id));
    refreshSongVocab(song.id);
    void refreshLocalMedia(song.id);
    return () => {
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id, router]);

  useEffect(() => {
    return () => {
      if (playbackUrl?.startsWith("blob:")) revokeLocalObjectUrl(playbackUrl);
    };
  }, [playbackUrl]);

  async function refreshLocalMedia(id: string) {
    const rec = await getLocalMp3(id);
    setLocalRecord(rec);
  }

  async function resolvePlayback() {
    if (!song) return;
    // Prefer device-local import when present (blob URL — never a public server of imports)
    const rec = await getLocalMp3(song.id);
    setLocalRecord(rec);
    if (rec && rightsAllowPlayback(song)) {
      if (playbackUrl?.startsWith("blob:")) revokeLocalObjectUrl(playbackUrl);
      const url = createLocalObjectUrl(rec);
      setPlaybackUrl(url);
      if (rec.durationSec) setDurationSec(rec.durationSec);
      setGateError(null);
      return;
    }
    // Hosted licensed asset via rights gate
    if (canPlayAudio(song) && song.audioUrl) {
      try {
        const res = await fetch(
          `/api/sing/asset?songId=${encodeURIComponent(song.id)}&type=audio_original`,
        );
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setGateError(data.error || "Audio not authorized");
          setPlaybackUrl(null);
          return;
        }
        if (playbackUrl?.startsWith("blob:")) revokeLocalObjectUrl(playbackUrl);
        setPlaybackUrl(data.url);
        setGateError(null);
      } catch {
        setGateError("Could not authorize audio");
        setPlaybackUrl(null);
      }
      return;
    }
    setPlaybackUrl(null);
  }

  useEffect(() => {
    void resolvePlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id, localRecord?.importedAt]);

  useEffect(() => {
    if (mode === "speak" || mode === "understand" || mode === "improve") {
      setPlaying(false);
    }
  }, [mode]);

  if (!song) {
    return (
      <div className="studio-shell">
        <p className="text-ink/50">Loading song…</p>
      </div>
    );
  }

  if (!rightsAllowPlayback(song)) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl text-ink" lang="vi">
          {song.title}
        </h1>
        <p className="mt-3 text-sm text-ink/60">{song.rights.note}</p>
        <Link href="/sing" className="teacher-btn-secondary mt-6 w-full text-center">
          Back to library
        </Link>
      </div>
    );
  }

  const track = song;
  const catalogLines = track.lines;
  const localLines = lyricDraft?.lines ?? [];
  const lines: LyricLine[] =
    localLines.length > 0 ? localLines : catalogLines.length > 0 ? catalogLines : [];
  const lyricsOk = rightsAllowLyrics(song) && lines.length > 0;

  const activeLine = lines.length ? findLineAt(lines, t) ?? lines[0] : null;
  const activeTok = lines.length ? findTokenAt(lines, t) : null;
  const focusLine: LyricLine | null =
    (focusLineId && lines.find((l) => l.id === focusLineId)) || activeLine;
  const displayLine =
    mode === "understand" || mode === "speak" ? focusLine : activeLine;

  function seek(sec: number) {
    setSeekTo(sec);
    setSeekNonce((n) => n + 1);
    setT(sec);
  }

  function jumpLine(delta: number) {
    if (!displayLine || !lines.length) return;
    const idx = lines.findIndex((l) => l.id === displayLine.id);
    const next = lines[Math.max(0, Math.min(lines.length - 1, idx + delta))];
    if (!next) return;
    setFocusLineId(next.id);
    seek(next.start);
  }

  async function onTapToken(token: LyricToken) {
    setSelected(token);
    if (mode === "listen" || mode === "understand" || mode === "speak") {
      setPlaying(false);
      try {
        await speakVietnamese(token.text);
      } catch {
        /* */
      }
    }
  }

  async function teachLineSpoken() {
    if (!displayLine) return;
    setSpeakLineId(displayLine.id);
    setMode("speak");
    setPlaying(false);
    const phrase = displayLine.tokens.map((x) => x.text).join(" ");
    try {
      await speakVietnamese(phrase);
    } catch {
      /* */
    }
  }

  function onSpeakScored(result: ScoreResult) {
    setAttempt((n) => n + 1);
    markSingMode(track.id, "speak", {
      speakBestScore: Math.max(
        result.quality ?? 0,
        getSongProgress(track.id)?.speakBestScore ?? 0,
      ),
    });
  }

  function saveSelected() {
    if (!selected || !displayLine) return;
    saveVocabItem({
      expression: selected.text,
      meaningEn: selected.meaningEn || selected.text,
      originalSentence: displayLine.tokens.map((x) => x.text).join(" "),
      sourceLessonId: `sing:${track.id}`,
    });
    bumpSingVocab(track.id);
    refreshSongVocab(track.id);
  }

  function refreshSongVocab(id: string) {
    const all = loadVocab();
    setSongVocab(
      all
        .filter((v) => v.sourceLessonId === `sing:${id}`)
        .map((v) => ({
          expression: v.expression,
          meaningEn: v.meaningEn,
          originalSentence: v.originalSentence,
        })),
    );
  }

  function selectMode(id: SingMode) {
    setMode(id);
    markSingMode(track.id, id, { lastPositionMs: Math.round(t * 1000) });
    pushPracticeHistory({ songId: track.id, songTitle: track.title, mode: id });
  }

  async function seedFromVm() {
    if (!isLocalAssetSong(track.id)) return;
    setSeedBusy(true);
    setGateError(null);
    try {
      const res = await fetch(`/api/sing/dev-seed/${encodeURIComponent(track.id)}`);
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setGateError(err.error || "VM seed unavailable (dev localhost only)");
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], `${track.id}.mp3`, { type: "audio/mpeg" });
      const duration = await probeAudioDuration(file);
      await saveLocalMp3(track.id, file, duration);
      await refreshLocalMedia(track.id);
      await resolvePlayback();
    } catch {
      setGateError("Could not seed from VM private-media");
    } finally {
      setSeedBusy(false);
    }
  }

  const showImporter = isLocalAssetSong(track.id) || devMode || !playbackUrl;

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      {playbackUrl ? (
        <KaraokePlayer
          trackId={song.id}
          audioUrl={playbackUrl}
          durationSec={durationSec || song.durationSec}
          playing={playing && (mode === "listen" || mode === "sing")}
          speed={speed}
          loop={loop}
          seekTo={seekTo}
          seekNonce={seekNonce}
          onTime={setT}
          onDuration={(sec) => setDurationSec(sec)}
          onPlayingChange={setPlaying}
          onEnded={() => markSingMode(song.id, mode)}
        />
      ) : null}

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
      <p className="text-sm text-ink/55">
        {song.artist}
        {song.songwriter ? ` · ${song.songwriter}` : ""} · {song.rights.status}
      </p>
      {gateError ? <p className="mt-2 text-sm text-coral">{gateError}</p> : null}

      {!playbackUrl ? (
        <section className="ami-card mt-5 px-4 py-5">
          <p className="quiet-label">Audio</p>
          <h2 className="mt-1 font-display text-xl text-ink">Add audio to start</h2>
          <p className="mt-2 text-sm text-ink/60">
            This song is licensed for ÁMi Lingua. Import an MP3 on this device, or load the VM seed
            file when developing locally.
          </p>
          {isLocalAssetSong(song.id) && process.env.NODE_ENV === "development" ? (
            <button
              type="button"
              className="teacher-btn-primary mt-4 w-full"
              disabled={seedBusy}
              onClick={() => void seedFromVm()}
            >
              {seedBusy ? "Loading seed…" : "Load VM-seeded MP3 into this browser"}
            </button>
          ) : null}
        </section>
      ) : null}

      {showImporter ? (
        <LocalMp3Importer
          songId={song.id}
          songTitle={song.title}
          existing={localRecord}
          onChanged={() => {
            void refreshLocalMedia(song.id).then(() => void resolvePlayback());
          }}
        />
      ) : null}

      {rightsAllowLyrics(song) ? (
        <LyricTimingEditor
          songId={song.id}
          durationSec={durationSec || song.durationSec}
          currentTime={t}
          draft={lyricDraft}
          onSaved={(d) => setLyricDraft(d)}
        />
      ) : null}

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {SING_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMode(m.id)}
            className={`rounded-2xl px-1 py-2.5 text-[11px] font-medium transition ${
              mode === m.id ? "bg-coral text-paper shadow-soft" : "bg-soft text-ink/70"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/45">{SING_MODES.find((m) => m.id === mode)?.hint}</p>

      {(mode === "listen" || mode === "sing") && (
        <section className="ami-card mt-5 px-4 py-5">
          {lyricsOk && displayLine ? (
            <>
              <div className="flex flex-wrap gap-1.5" lang="vi">
                {displayLine.tokens.map((tok) => {
                  const active = activeTok?.token.id === tok.id;
                  const picked = selected?.id === tok.id;
                  return (
                    <button
                      key={tok.id}
                      type="button"
                      onClick={() => void onTapToken(tok)}
                      className={`rounded-xl px-2.5 py-1.5 text-2xl font-medium transition ${
                        active
                          ? "bg-coral text-paper shadow-soft"
                          : picked
                            ? "bg-amber/25 text-ink ring-1 ring-coral/40"
                            : "bg-soft text-ink/80"
                      }`}
                    >
                      {tok.text}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-[#e8d9c8] pt-3">
                <p className="quiet-label">English subtitle</p>
                <p className="mt-1 text-lg text-ink/65">
                  {displayLine.translationEn || "Add an English line in the timing editor."}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink/55">
              Paste lyrics you supply in the timing editor, mark start/end while the song plays, then
              listen with syllable highlight.
            </p>
          )}
        </section>
      )}

      {mode === "understand" && (
        <section className="ami-card mt-5 px-4 py-5">
          <p className="quiet-label">Understand</p>
          {displayLine ? (
            <>
              <p className="mt-2 font-display text-2xl text-ink" lang="vi">
                {displayLine.tokens.map((x) => x.text).join(" ")}
              </p>
              <p className="mt-2 text-ink/65">{displayLine.translationEn}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {displayLine.tokens.map((tok) => (
                  <button
                    key={tok.id}
                    type="button"
                    onClick={() => void onTapToken(tok)}
                    className={`rounded-xl px-2.5 py-1.5 text-xl ${
                      selected?.id === tok.id ? "bg-coral text-paper" : "bg-soft text-ink"
                    }`}
                  >
                    {tok.text}
                  </button>
                ))}
              </div>
              {selected ? (
                <div className="mt-4 border-t border-[#e8d9c8] pt-3">
                  <p className="font-display text-3xl text-ink" lang="vi">
                    {selected.text}
                  </p>
                  <p className="mt-1 text-lg text-ink/65">
                    {selected.meaningEn || "Add a meaning when you save vocab."}
                  </p>
                  <button
                    type="button"
                    className="teacher-btn-secondary mt-3 py-2 text-sm"
                    onClick={() => void speakVietnamese(selected.text)}
                  >
                    Hear pronunciation (TTS)
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink/45">Tap a word above.</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="teacher-btn-secondary flex-1"
                  onClick={() => jumpLine(-1)}
                >
                  Previous line
                </button>
                <button
                  type="button"
                  className="teacher-btn-secondary flex-1"
                  onClick={() => jumpLine(1)}
                >
                  Next line
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink/50">Add timed lyrics first.</p>
          )}
        </section>
      )}

      {(mode === "listen" || mode === "sing") && playbackUrl ? (
        <>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" className="circle-btn" onClick={() => jumpLine(-1)} aria-label="Previous line">
              ‹
            </button>
            <button
              type="button"
              className="circle-btn-primary"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button type="button" className="circle-btn" onClick={() => jumpLine(1)} aria-label="Next line">
              ›
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={durationSec || song.durationSec || 1}
            step={0.05}
            value={t}
            onChange={(e) => seek(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--coral)]"
            aria-label="Song position"
          />
          <p className="mt-1 text-center text-xs text-ink/40">
            {formatKaraokeTime(t)} / {formatKaraokeTime(durationSec || song.durationSec)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={`rounded-xl px-3 py-1.5 text-sm ${
                  speed === s ? "bg-ink text-paper" : "bg-soft text-ink/70"
                }`}
                onClick={() => setSpeed(s)}
              >
                {s}×
              </button>
            ))}
            <button
              type="button"
              className="rounded-xl bg-soft px-3 py-1.5 text-sm text-ink/70"
              disabled={!displayLine}
              onClick={() =>
                loop || !displayLine
                  ? setLoop(null)
                  : setLoop({ start: displayLine.start, end: displayLine.end })
              }
            >
              {loop ? "Clear loop" : "Loop line"}
            </button>
            <button
              type="button"
              className="rounded-xl bg-soft px-3 py-1.5 text-sm text-ink/70"
              onClick={() => {
                seek(0);
                setPlaying(true);
              }}
            >
              Restart
            </button>
          </div>
        </>
      ) : null}

      {selected && mode !== "understand" && mode !== "improve" ? (
        <section className="ami-card mt-5 animate-pop px-4 py-4">
          <p className="quiet-label">Tap-to-learn</p>
          <p className="mt-1 font-display text-3xl text-ink" lang="vi">
            {selected.text}
          </p>
          <p className="mt-1 text-lg text-ink/65">{selected.meaningEn || "—"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="teacher-btn-secondary py-2 text-sm"
              onClick={() => void speakVietnamese(selected.text)}
            >
              Hear word
            </button>
            <button type="button" className="teacher-btn-amber py-2 text-sm" onClick={saveSelected}>
              Save to vocab
            </button>
          </div>
        </section>
      ) : null}

      {mode === "speak" ? (
        <section className="ami-card mt-5 px-4 py-4">
          <p className="quiet-label">Speak</p>
          <p className="mt-1 text-sm text-ink/60">
            Music paused. Hear TTS, then speak clearly — singing pitch is never a tone score.
          </p>
          {displayLine ? (
            <>
              <p className="mt-3 font-display text-xl text-ink" lang="vi">
                {displayLine.tokens.map((x) => x.text).join(" ")}
              </p>
              <button
                type="button"
                className="teacher-btn-secondary mt-3 w-full"
                onClick={() => void teachLineSpoken()}
              >
                {speakLineId === displayLine.id ? "Hear again" : "Hear native model (TTS)"}
              </button>
              {canRecordUgc(song) ? (
                <div className="mt-4">
                  <SingSpeakMic
                    phrase={displayLine.tokens.map((x) => x.text).join(" ")}
                    songId={song.id}
                    attemptIndex={attempt}
                    onScored={onSpeakScored}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm text-ink/50">Add a timed line first.</p>
          )}
        </section>
      ) : null}

      {mode === "sing" && canRecordUgc(song) ? (
        <section className="ami-card mt-5 px-4 py-4">
          <p className="quiet-label">Sing along</p>
          <p className="mt-1 text-xs text-ink/45">
            Optional mic take stays on this device. Pitch ≠ Vietnamese tone accuracy.
          </p>
          <LocalMicRecorder />
        </section>
      ) : null}

      {mode === "improve" ? (
        <section className="ami-card mt-5 px-4 py-4">
          <p className="quiet-label">Improve</p>
          {songVocab.length === 0 ? (
            <p className="mt-2 text-sm text-ink/50">
              Save words from Listen or Understand to review them here.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {songVocab.map((v) => (
                <li key={v.expression} className="border-b border-[#e8d9c8] pb-3 last:border-0">
                  <p className="font-display text-2xl text-ink" lang="vi">
                    {v.expression}
                  </p>
                  <p className="text-ink/65">{v.meaningEn}</p>
                  <button
                    type="button"
                    className="teacher-btn-secondary mt-2 py-1.5 text-sm"
                    onClick={() => void speakVietnamese(v.expression)}
                  >
                    Hear
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/vocab"
            className="mt-4 inline-block text-sm text-coral underline-offset-2 hover:underline"
          >
            Open full vocab deck
          </Link>
        </section>
      ) : null}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="teacher-btn-secondary flex-1"
          onClick={() => {
            const next = !saved;
            saveSongFavorite(song.id, next);
            setSaved(next);
          }}
        >
          {saved ? "Saved ✓" : "Save song"}
        </button>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink/35">{song.rights.note}</p>
      <Link href="/sing" className="teacher-btn-secondary mt-6 w-full text-center">
        Back to library
      </Link>
    </div>
  );
}
