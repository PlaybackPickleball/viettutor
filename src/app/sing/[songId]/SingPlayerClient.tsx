"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { KaraokePlayer, formatKaraokeTime } from "@/components/KaraokePlayer";
import { SingSpeakMic } from "@/components/SingSpeakMic";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import { getSong } from "@/lib/sing/catalog";
import {
  bumpSingVocab,
  getSongProgress,
  loadSavedSongIds,
  markSingMode,
  pushPracticeHistory,
  saveSongFavorite,
} from "@/lib/sing/progress";
import {
  availabilityLabel,
  canPlayAudio,
  canRecordUgc,
  canShowLyrics,
} from "@/lib/sing/rights";
import { findLineAt, findTokenAt } from "@/lib/sing/timing";
import type { LyricLine, LyricToken, SingMode } from "@/lib/sing/types";
import type { ScoreResult } from "@/lib/pronunciation/types";
import { loadVocab, saveVocabItem } from "@/lib/vocab/store";

const SPEEDS = [0.75, 1, 1.25] as const;

const MODES: { id: SingMode; label: string; hint: string }[] = [
  { id: "listen", label: "Listen", hint: "Follow the glow — tap words for meaning." },
  { id: "words", label: "Words", hint: "Line lesson: meaning, tone, and structure." },
  { id: "sing", label: "Sing", hint: "Karaoke practice — pitch is not a tone score." },
  { id: "speak", label: "Speak", hint: "Music off — speak clearly like a native." },
  { id: "vocab", label: "Vocab", hint: "Review words saved from this song." },
];

export function SingPlayerClient({ songId }: { songId: string }) {
  const router = useRouter();
  const song = useMemo(() => getSong(songId), [songId]);
  const playable = song ? canPlayAudio(song) : false;
  const lyricsOk = song ? canShowLyrics(song) : false;

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
  const [songVocab, setSongVocab] = useState<
    { expression: string; meaningEn: string; originalSentence?: string }[]
  >([]);
  const [gatedUrl, setGatedUrl] = useState<string | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (!song) {
      router.replace("/sing");
      return;
    }
    setSaved(loadSavedSongIds().includes(song.id));
    refreshSongVocab(song.id);
    return () => stopSpeaking();
  }, [song, router]);

  useEffect(() => {
    if (!song || !playable || !song.audioUrl) {
      setGatedUrl(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/sing/asset?songId=${encodeURIComponent(song.id)}&type=audio_original`,
        );
        const data = (await res.json()) as { url?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.url) {
          setGateError(data.error || "Audio not authorized");
          setGatedUrl(null);
          return;
        }
        setGateError(null);
        setGatedUrl(data.url);
      } catch {
        if (!cancelled) setGateError("Could not authorize audio");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [song, playable]);

  useEffect(() => {
    if (mode === "speak" || mode === "words" || mode === "vocab") {
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

  // Pending / unlicensed commercial catalog entry
  if (!playable || !lyricsOk) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <div className="flex items-start justify-between gap-3">
          <BrandMark />
          <Link href="/sing" className="text-sm text-coral underline-offset-2 hover:underline">
            Library
          </Link>
        </div>
        <p className="quiet-label mt-5">ÁMi Sing · Catalog</p>
        <h1 className="mt-1 font-display text-2xl text-ink" lang="vi">
          {song.title}
        </h1>
        <p className="text-sm text-ink/55">
          {song.artist}
          {song.songwriter ? ` · Songwriter: ${song.songwriter}` : ""}
        </p>
        <section className="ami-card mt-5 px-4 py-5">
          <p className="quiet-label">Availability</p>
          <p className="mt-1 text-lg text-ink">{availabilityLabel(song)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">{song.rights.note}</p>
          <p className="mt-3 text-sm text-ink/55">{song.summary}</p>
          <ul className="mt-4 list-inside list-disc text-sm text-ink/60">
            {song.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink/40">
            Status: {song.rights.status} · No in-app audio or lyrics until rights are approved.
          </p>
          {song.externalListenUrl ? (
            <a
              href={song.externalListenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="teacher-btn-secondary mt-5 block w-full text-center"
            >
              Listen externally (leaves ÁMi)
            </a>
          ) : null}
        </section>
        <Link href="/sing" className="teacher-btn-secondary mt-6 w-full text-center">
          Back to library
        </Link>
      </div>
    );
  }

  const track = song;
  const lines = track.lines;
  const activeLine = findLineAt(lines, t) ?? lines[0];
  const activeTok = findTokenAt(lines, t);
  const focusLine: LyricLine =
    (focusLineId && lines.find((l) => l.id === focusLineId)) || activeLine;
  const displayLine = mode === "words" || mode === "speak" ? focusLine : activeLine;

  function seek(sec: number) {
    setSeekTo(sec);
    setSeekNonce((n) => n + 1);
    setT(sec);
  }

  function jumpLine(delta: number) {
    const idx = lines.findIndex((l) => l.id === displayLine.id);
    const next = lines[Math.max(0, Math.min(lines.length - 1, idx + delta))];
    if (!next) return;
    setFocusLineId(next.id);
    seek(next.start);
  }

  async function onTapToken(token: LyricToken) {
    setSelected(token);
    if (mode === "listen" || mode === "words" || mode === "speak") {
      setPlaying(false);
      try {
        await speakVietnamese(token.text);
      } catch {
        /* */
      }
    }
  }

  async function teachLineSpoken() {
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
    if (!selected) return;
    saveVocabItem({
      expression: selected.text,
      meaningEn: selected.meaningEn,
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

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      {gatedUrl ? (
        <KaraokePlayer
          song={song}
          audioUrl={gatedUrl}
          playing={playing && (mode === "listen" || mode === "sing")}
          speed={speed}
          loop={loop}
          seekTo={seekTo}
          seekNonce={seekNonce}
          onTime={setT}
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
      <p className="text-sm text-ink/55">{song.titleEn}</p>
      {gateError ? <p className="mt-2 text-sm text-coral">{gateError}</p> : null}

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {MODES.map((m) => (
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
      <p className="mt-2 text-xs text-ink/45">{MODES.find((m) => m.id === mode)?.hint}</p>

      {/* Karaoke / listen stage */}
      {(mode === "listen" || mode === "sing") && (
        <section className="ami-card mt-5 px-4 py-5">
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
            <p className="mt-1 text-lg text-ink/65">{displayLine.translationEn}</p>
          </div>
        </section>
      )}

      {/* Learn the Words */}
      {mode === "words" && (
        <section className="ami-card mt-5 px-4 py-5">
          <p className="quiet-label">Learn the Words</p>
          <p className="mt-2 font-display text-2xl text-ink" lang="vi">
            {displayLine.tokens.map((x) => x.text).join(" ")}
          </p>
          <p className="mt-2 text-ink/65">{displayLine.translationEn}</p>
          <div className="mt-4 flex flex-wrap gap-1.5" lang="vi">
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
              <p className="mt-1 text-lg text-ink/65">{selected.meaningEn}</p>
              {selected.toneHint ? (
                <p className="mt-2 text-sm text-ink/55">Tone cue: {selected.toneHint}</p>
              ) : null}
              {selected.note ? <p className="mt-1 text-sm text-ink/55">{selected.note}</p> : null}
              <button
                type="button"
                className="teacher-btn-secondary mt-3 py-2 text-sm"
                onClick={() => void speakVietnamese(selected.text)}
              >
                Hear pronunciation
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/45">Tap a syllable or word above.</p>
          )}
          <div className="mt-4 flex gap-2">
            <button type="button" className="teacher-btn-secondary flex-1" onClick={() => jumpLine(-1)}>
              Previous line
            </button>
            <button type="button" className="teacher-btn-secondary flex-1" onClick={() => jumpLine(1)}>
              Next line
            </button>
          </div>
        </section>
      )}

      {/* Transport */}
      {(mode === "listen" || mode === "sing") && (
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
              disabled={!gatedUrl}
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
            max={song.durationSec}
            step={0.05}
            value={t}
            onChange={(e) => seek(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--coral)]"
            aria-label="Song position"
          />
          <p className="mt-1 text-center text-xs text-ink/40">
            {formatKaraokeTime(t)} / {formatKaraokeTime(song.durationSec)}
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
              onClick={() =>
                loop
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
      )}

      {selected && mode !== "words" && mode !== "vocab" ? (
        <section className="ami-card mt-5 animate-pop px-4 py-4">
          <p className="quiet-label">Tap-to-learn</p>
          <p className="mt-1 font-display text-3xl text-ink" lang="vi">
            {selected.text}
          </p>
          <p className="mt-1 text-lg text-ink/65">{selected.meaningEn}</p>
          {selected.note ? <p className="mt-2 text-sm text-ink/55">{selected.note}</p> : null}
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
          <p className="quiet-label">Speak Like a Native</p>
          <p className="mt-1 text-sm text-ink/60">
            Music is muted. Listen, repeat, then get feedback from our pronunciation service.
            Singing pitch is never treated as tone accuracy.
          </p>
          <p className="mt-3 font-display text-xl text-ink" lang="vi">
            {displayLine.tokens.map((x) => x.text).join(" ")}
          </p>
          <p className="mt-1 text-ink/55">{displayLine.translationEn}</p>
          <button
            type="button"
            className="teacher-btn-secondary mt-3 w-full"
            onClick={() => void teachLineSpoken()}
          >
            {speakLineId === displayLine.id ? "Hear native model again" : "Hear native model"}
          </button>
          <div className="mt-3 flex gap-2">
            <button type="button" className="teacher-btn-secondary flex-1" onClick={() => jumpLine(-1)}>
              Previous
            </button>
            <button type="button" className="teacher-btn-secondary flex-1" onClick={() => jumpLine(1)}>
              Next phrase
            </button>
          </div>
          {canRecordUgc(song) ? (
            <div className="mt-4">
              <SingSpeakMic
                phrase={displayLine.tokens.map((x) => x.text).join(" ")}
                songId={song.id}
                attemptIndex={attempt}
                onScored={onSpeakScored}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/50">Recording is not permitted for this title.</p>
          )}
        </section>
      ) : null}

      {mode === "sing" ? (
        <p className="mt-4 text-center text-xs text-ink/40">
          Sing along for joy — we don’t grade musical pitch as Vietnamese tones.
          {canRecordUgc(song)
            ? " Optional mic recording stays private until you consent to save."
            : ""}
        </p>
      ) : null}

      {mode === "vocab" ? (
        <section className="ami-card mt-5 px-4 py-4">
          <p className="quiet-label">Vocabulary Review</p>
          {songVocab.length === 0 ? (
            <p className="mt-2 text-sm text-ink/50">
              No saved words from this song yet. Tap a word in Listen or Words mode and save it.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {songVocab.map((v) => (
                <li key={v.expression} className="border-b border-[#e8d9c8] pb-3 last:border-0">
                  <p className="font-display text-2xl text-ink" lang="vi">
                    {v.expression}
                  </p>
                  <p className="text-ink/65">{v.meaningEn}</p>
                  {v.originalSentence ? (
                    <p className="mt-1 text-xs text-ink/45" lang="vi">
                      Context: {v.originalSentence}
                    </p>
                  ) : null}
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
          <Link href="/vocab" className="mt-4 inline-block text-sm text-coral underline-offset-2 hover:underline">
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
