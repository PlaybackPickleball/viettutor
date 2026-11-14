"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SingSpeakMic } from "@/components/SingSpeakMic";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import { getSong, lineAtTime, tokenAtTime } from "@/lib/sing/catalog";
import { bumpSingVocab, markSingMode } from "@/lib/sing/progress";
import type { LyricToken, SingMode } from "@/lib/sing/types";
import type { ScoreResult } from "@/lib/pronunciation/types";
import { saveVocabItem } from "@/lib/vocab/store";

const SPEEDS = [0.75, 1, 1.25] as const;

export function SingPlayerClient({ songId }: { songId: string }) {
  const router = useRouter();
  const song = useMemo(() => getSong(songId), [songId]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<SingMode>("listen");
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [loop, setLoop] = useState<{ start: number; end: number } | null>(null);
  const [selected, setSelected] = useState<LyricToken | null>(null);
  const [speakLineId, setSpeakLineId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!song) {
      router.replace("/sing");
      return;
    }
    const audio = new Audio(song.audioUrl);
    audio.preload = "auto";
    // Pitch-preserving rate when the browser supports it
    (audio as HTMLMediaElement & { preservesPitch?: boolean }).preservesPitch = true;
    (audio as HTMLMediaElement & { mozPreservesPitch?: boolean }).mozPreservesPitch = true;
    (audio as HTMLMediaElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch =
      true;
    audio.playbackRate = speed;
    audioRef.current = audio;

    const onTime = () => {
      const cur = audio.currentTime;
      setT(cur);
      if (loop && cur >= loop.end) {
        audio.currentTime = loop.start;
      }
    };
    const onEnded = () => {
      setPlaying(false);
      markSingMode(song.id, mode);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recreate audio when song changes
  }, [song?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    // Speak mode pauses music
    if (mode === "speak") {
      audioRef.current?.pause();
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

  const track = song;
  const activeLine = lineAtTime(track, t);
  const activeTok = tokenAtTime(track, t);
  const displayLine = activeLine ?? track.lines[0];

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (mode === "speak") {
      setMode("sing");
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        /* autoplay policies */
      }
    }
  }

  function seek(sec: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(track.durationSec, sec));
    setT(audio.currentTime);
  }

  function loopCurrentLine() {
    if (!displayLine) return;
    setLoop({ start: displayLine.start, end: displayLine.end });
    seek(displayLine.start);
  }

  function clearLoop() {
    setLoop(null);
  }

  async function onTapToken(token: LyricToken) {
    setSelected(token);
    if (mode === "listen" || mode === "speak") {
      audioRef.current?.pause();
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
    audioRef.current?.pause();
    setPlaying(false);
    const phrase = displayLine.tokens.map((x) => x.text).join(" ");
    try {
      await speakVietnamese(phrase, { slow: false });
    } catch {
      /* */
    }
  }

  function onSpeakScored(result: ScoreResult) {
    setAttempt((n) => n + 1);
    markSingMode(track.id, "speak", {
      speakBestScore: Math.max(result.quality ?? 0, getSongProgressBest(track.id)),
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
      <p className="text-sm text-ink/55">{song.titleEn}</p>

      {/* Mode switcher */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {(
          [
            ["listen", "Listen"],
            ["sing", "Sing"],
            ["speak", "Speak"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              markSingMode(song.id, id);
            }}
            className={`rounded-2xl px-2 py-2.5 text-sm font-medium transition ${
              mode === id ? "bg-coral text-paper shadow-soft" : "bg-soft text-ink/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/45">
        {mode === "listen" && "Learn the lyrics and meaning — tap any word."}
        {mode === "sing" && "Follow the glow and sing with the music (pitch ≠ tone score)."}
        {mode === "speak" && "Music pauses — hear native speech, then record clear speaking."}
      </p>

      {/* Karaoke stage */}
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

      {/* Transport */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          className="circle-btn"
          onClick={() => seek(Math.max(0, t - 3))}
          aria-label="Back 3 seconds"
        >
          −3s
        </button>
        <button
          type="button"
          className="circle-btn-primary"
          onClick={() => void togglePlay()}
          aria-label={playing ? "Pause" : "Play"}
          disabled={mode === "speak"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          className="circle-btn"
          onClick={() => seek(Math.min(song.durationSec, t + 3))}
          aria-label="Forward 3 seconds"
        >
          +3s
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
        {formatTime(t)} / {formatTime(song.durationSec)}
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
            {s}× speed
          </button>
        ))}
        <button
          type="button"
          className="rounded-xl bg-soft px-3 py-1.5 text-sm text-ink/70"
          onClick={loop ? clearLoop : loopCurrentLine}
        >
          {loop ? "Clear loop" : "Loop line"}
        </button>
        <button
          type="button"
          className="rounded-xl bg-soft px-3 py-1.5 text-sm text-ink/70"
          onClick={() => void teachLineSpoken()}
        >
          Speak this line
        </button>
      </div>

      {/* Word card */}
      {selected ? (
        <section className="ami-card mt-5 px-4 py-4 animate-pop">
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

      {/* Speak mode panel */}
      {mode === "speak" ? (
        <section className="ami-card mt-5 px-4 py-4">
          <p className="quiet-label">Speak & Master</p>
          <p className="mt-1 text-sm text-ink/60">
            Music is paused. Listen to native speech, then speak the line clearly — not sung.
            Feedback uses our pronunciation service (simulated scoring). Singing pitch is never a
            tone accuracy score.
          </p>
          <p className="mt-3 font-display text-xl text-ink" lang="vi">
            {displayLine.tokens.map((x) => x.text).join(" ")}
          </p>
          <button
            type="button"
            className="teacher-btn-secondary mt-3 w-full"
            onClick={() => void teachLineSpoken()}
          >
            {speakLineId === displayLine.id ? "Hear native model again" : "Hear native model"}
          </button>
          <div className="mt-4">
            <SingSpeakMic
              phrase={displayLine.tokens.map((x) => x.text).join(" ")}
              songId={song.id}
              attemptIndex={attempt}
              onScored={onSpeakScored}
            />
          </div>
        </section>
      ) : null}

      {mode === "sing" ? (
        <p className="mt-4 text-center text-xs text-ink/40">
          Sing along for joy — we don’t grade musical pitch as Vietnamese tones.
        </p>
      ) : null}

      <p className="mt-6 text-[11px] leading-relaxed text-ink/35">{song.license}</p>

      <Link href="/sing" className="teacher-btn-secondary mt-6 w-full text-center">
        Back to library
      </Link>
    </div>
  );
}

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function getSongProgressBest(songId: string) {
  if (typeof window === "undefined") return 0;
  try {
    const all = JSON.parse(localStorage.getItem("ami-lingua.sing-progress.v1") || "{}") as Record<
      string,
      { speakBestScore?: number }
    >;
    return all[songId]?.speakBestScore ?? 0;
  } catch {
    return 0;
  }
}
