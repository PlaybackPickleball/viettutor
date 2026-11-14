"use client";

import { useEffect, useMemo, useState } from "react";
import { KaraokePlayer, formatKaraokeTime } from "@/components/KaraokePlayer";
import { BilingualKaraokeStage } from "@/components/karaoke/BilingualKaraokeStage";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import type { KaraokeMode, KaraokeSong, LyricToken } from "@/lib/karaoke/types";
import { msToSec, secToMs } from "@/lib/karaoke/types";
import { findLineAtMs } from "@/lib/karaoke/engine";
import { SingSpeakMic } from "@/components/SingSpeakMic";
import { saveVocabItem } from "@/lib/vocab/store";

const SPEEDS = [0.75, 1, 1.25] as const;
const MODES: { id: KaraokeMode; label: string; hint: string }[] = [
  {
    id: "learn",
    label: "Learn",
    hint: "Word glosses + line translation. Tap a word to hear it.",
  },
  { id: "sing", label: "Sing", hint: "Clean karaoke — translations hidden." },
  {
    id: "practice",
    label: "Practice",
    hint: "Loop the current line, record, and compare with TTS.",
  },
];

type Props = {
  song: KaraokeSong;
};

/**
 * Modular bilingual karaoke engine: HTMLAudio clock + rAF via KaraokePlayer,
 * progressive word fill, Learn / Sing / Practice.
 */
export function BilingualKaraokePlayer({ song }: Props) {
  const [mode, setMode] = useState<KaraokeMode>("learn");
  const [playing, setPlaying] = useState(false);
  const [tSec, setTSec] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [seekNonce, setSeekNonce] = useState(0);
  const [loop, setLoop] = useState<{ start: number; end: number } | null>(null);
  const [selected, setSelected] = useState<LyricToken | null>(null);
  const [duckUntil, setDuckUntil] = useState(0);

  const tMs = secToMs(tSec);
  const durationSec = msToSec(song.durationMs);
  const activeLine = useMemo(
    () => findLineAtMs(song.lines, tMs) ?? song.lines[0] ?? null,
    [song.lines, tMs],
  );

  useEffect(() => () => stopSpeaking(), []);

  function seek(sec: number) {
    setSeekTo(sec);
    setSeekNonce((n) => n + 1);
    setTSec(sec);
  }

  async function onTapToken(token: LyricToken) {
    setSelected(token);
    setPlaying(false);
    setDuckUntil(Date.now() + 2500);
    try {
      await speakVietnamese(token.text);
    } catch {
      /* */
    }
  }

  function loopActiveLine() {
    if (!activeLine) return;
    const start = msToSec(activeLine.startMs);
    const end = msToSec(activeLine.endMs);
    setLoop({ start, end });
    seek(start);
    setPlaying(true);
  }

  function saveSelected() {
    if (!selected || !activeLine) return;
    saveVocabItem({
      expression: selected.text,
      meaningEn: selected.contextualEnglish || selected.text,
      originalSentence: activeLine.textVi,
      sourceLessonId: `karaoke:${song.id}`,
    });
  }

  const audioPlaying = playing && Date.now() > duckUntil;

  return (
    <div className="mt-4">
      <KaraokePlayer
        trackId={song.id}
        audioUrl={song.audioUrl}
        durationSec={durationSec}
        playing={audioPlaying && (mode !== "practice" || Boolean(loop))}
        speed={speed}
        loop={loop}
        seekTo={seekTo}
        seekNonce={seekNonce}
        onTime={setTSec}
        onPlayingChange={setPlaying}
      />

      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              if (m.id === "practice") setPlaying(false);
            }}
            className={`rounded-2xl px-2 py-2.5 text-sm font-medium ${
              mode === m.id ? "bg-coral text-paper shadow-soft" : "bg-soft text-ink/70"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/45">{MODES.find((m) => m.id === mode)?.hint}</p>

      <div className="mt-4">
        <BilingualKaraokeStage
          song={song}
          currentMs={tMs}
          mode={mode}
          selectedId={selected?.id ?? null}
          onTapToken={(tok) => void onTapToken(tok)}
        />
      </div>

      {mode !== "practice" ? (
        <>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              className="circle-btn"
              onClick={() => seek(Math.max(0, tSec - 3))}
              aria-label="Back 3 seconds"
            >
              −3s
            </button>
            <button
              type="button"
              className="circle-btn-primary"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              className="circle-btn"
              onClick={() => seek(Math.min(durationSec, tSec + 3))}
              aria-label="Forward 3 seconds"
            >
              +3s
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={durationSec}
            step={0.05}
            value={tSec}
            onChange={(e) => seek(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--coral)]"
            aria-label="Song position"
          />
          <p className="mt-1 text-center text-xs text-ink/40">
            {formatKaraokeTime(tSec)} / {formatKaraokeTime(durationSec)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
              onClick={() => (loop ? setLoop(null) : loopActiveLine())}
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
      ) : (
        <section className="ami-card mt-4 px-4 py-4">
          <p className="quiet-label">Practice line</p>
          {activeLine ? (
            <>
              <p className="mt-2 font-display text-2xl text-ink" lang="vi">
                {activeLine.textVi}
              </p>
              <p className="mt-1 text-ink/60">{activeLine.translationEn}</p>
              <button
                type="button"
                className="teacher-btn-secondary mt-3 w-full"
                onClick={() => void speakVietnamese(activeLine.textVi)}
              >
                Hear TTS model
              </button>
              <button
                type="button"
                className="teacher-btn-secondary mt-2 w-full"
                onClick={loopActiveLine}
              >
                Loop line with music
              </button>
              <div className="mt-4">
                <SingSpeakMic
                  phrase={activeLine.textVi}
                  songId={song.id}
                  attemptIndex={0}
                  onScored={() => undefined}
                />
              </div>
              <LocalMicRecorder label="Optional singing take (local only)" />
            </>
          ) : (
            <p className="mt-2 text-sm text-ink/50">No active line.</p>
          )}
        </section>
      )}

      {selected && mode === "learn" ? (
        <section className="ami-card mt-4 animate-pop px-4 py-4">
          <p className="quiet-label">Vocabulary</p>
          <p className="mt-1 font-display text-3xl text-ink" lang="vi">
            {selected.text}
          </p>
          <p className="mt-1 text-lg text-ink/65">{selected.contextualEnglish}</p>
          <p className="mt-2 text-sm text-ink/50">
            Tone: {selected.toneMetadata.label}
            {selected.toneMetadata.note ? ` — ${selected.toneMetadata.note}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="teacher-btn-secondary py-2 text-sm"
              onClick={() => void speakVietnamese(selected.text)}
            >
              Hear again
            </button>
            <button type="button" className="teacher-btn-amber py-2 text-sm" onClick={saveSelected}>
              Save word
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
