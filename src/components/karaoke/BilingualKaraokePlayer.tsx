"use client";

import { useEffect, useMemo, useState } from "react";
import { KaraokePlayer, formatKaraokeTime } from "@/components/KaraokePlayer";
import { BilingualKaraokeStage } from "@/components/karaoke/BilingualKaraokeStage";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import type { KaraokeMode, KaraokeSong, LyricLine, LyricToken } from "@/lib/karaoke/types";
import { msToSec, secToMs } from "@/lib/karaoke/types";
import {
  adjacentLine,
  findLineAtMs,
  phraseForRewind,
  songHasIntro,
  vocalsStartAudioSec,
} from "@/lib/karaoke/engine";
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
    hint: "Tap a word or Hear whole phrase — AI reads the full line, not word-by-word.",
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

  /** Single timing source: audio.currentTime, shifted by approved globalOffsetMs. */
  const tMs = secToMs(tSec) - (song.globalOffsetMs ?? 0);
  const durationSec = msToSec(song.durationMs);
  const activeLine = useMemo(() => findLineAtMs(song.lines, tMs), [song.lines, tMs]);

  useEffect(() => () => stopSpeaking(), []);

  function seek(sec: number) {
    setSeekTo(sec);
    setSeekNonce((n) => n + 1);
    setTSec(sec);
  }

  /** Line under the playhead, or nearest phrase when between lines / paused. */
  const practiceLine =
    activeLine ?? phraseForRewind(song.lines, tMs) ?? song.lines[0] ?? null;

  function lineForToken(token: LyricToken): LyricLine | null {
    return song.lines.find((l) => l.tokens.some((t) => t.id === token.id)) ?? practiceLine;
  }

  async function onTapToken(token: LyricToken) {
    // Practice: any word tap reads the whole phrase, not word-by-word.
    if (mode === "practice") {
      await hearFullSentence(lineForToken(token));
      return;
    }
    setSelected(token);
    setPlaying(false);
    setDuckUntil(Date.now() + 2500);
    try {
      await speakVietnamese(token.text);
    } catch {
      /* */
    }
  }

  /** Pause the track and have AI read the whole lyric sentence (not a single word). */
  async function hearFullSentence(line: LyricLine | null | undefined, opts?: { slow?: boolean }) {
    if (!line?.textVi?.trim()) return;
    stopSpeaking();
    setPlaying(false);
    setSelected(null);
    const approxMs = Math.max(2200, line.textVi.length * (opts?.slow ? 180 : 120));
    setDuckUntil(Date.now() + approxMs);
    try {
      await speakVietnamese(line.textVi, { slow: opts?.slow ?? false, rate: opts?.slow ? 0.72 : 0.88 });
    } catch {
      /* */
    }
  }

  function audioSecForLine(line: LyricLine) {
    const offsetSec = msToSec(song.globalOffsetMs ?? 0);
    return {
      start: Math.max(0, msToSec(line.startMs) + offsetSec),
      end: Math.max(0, msToSec(line.endMs) + offsetSec),
    };
  }

  /** Seek track to a lyric sentence and keep looping it for recite practice. */
  function repeatPhrase(line: LyricLine | null | undefined) {
    if (!line) return;
    stopSpeaking();
    const { start, end } = audioSecForLine(line);
    setLoop({ start, end });
    seek(start);
    setPlaying(true);
  }

  function rewindAndRepeatPhrase() {
    repeatPhrase(phraseForRewind(song.lines, tMs) ?? practiceLine);
  }

  function repeatPreviousPhrase() {
    const current = phraseForRewind(song.lines, tMs) ?? practiceLine;
    const prev = adjacentLine(song.lines, current?.id, -1) ?? current;
    repeatPhrase(prev);
  }

  const vocalsStartSec = vocalsStartAudioSec(song);
  const hasIntro = songHasIntro(song);
  const inIntro =
    hasIntro && vocalsStartSec != null && tSec < vocalsStartSec - 0.35;

  /** Jump past instrumental intro to the first lyric / vocals. */
  function skipIntro() {
    if (vocalsStartSec == null) return;
    stopSpeaking();
    setLoop(null);
    seek(vocalsStartSec);
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
          onHearPhrase={
            mode === "practice" ? (line) => void hearFullSentence(line) : undefined
          }
        />
      </div>

      {mode !== "practice" ? (
        <>
          {inIntro ? (
            <button
              type="button"
              className="teacher-btn-primary mt-4 w-full"
              onClick={skipIntro}
            >
              Skip intro · jump to song
            </button>
          ) : null}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              className="circle-btn"
              onClick={repeatPreviousPhrase}
              aria-label="Previous phrase and loop"
              title="Previous phrase"
            >
              ⟲
            </button>
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
            <button
              type="button"
              className={`circle-btn ${loop ? "bg-coral text-paper" : ""}`}
              onClick={rewindAndRepeatPhrase}
              aria-label="Repeat this phrase with the track"
              title="Repeat phrase"
            >
              ↻
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
          {loop && activeLine ? (
            <p className="mt-2 text-center text-xs text-coral" lang="vi">
              Repeating: {phraseForRewind(song.lines, tMs)?.textVi ?? activeLine.textVi}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-ink/40">
              ↻ repeats this phrase · ⟲ goes to the previous sentence
            </p>
          )}
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
              className={`rounded-xl px-3 py-1.5 text-sm ${
                loop ? "bg-coral text-paper" : "bg-soft text-ink/70"
              }`}
              onClick={() => (loop ? setLoop(null) : rewindAndRepeatPhrase())}
            >
              {loop ? "Stop repeat" : "Repeat phrase"}
            </button>
            <button
              type="button"
              className="rounded-xl bg-soft px-3 py-1.5 text-sm text-ink/70"
              onClick={repeatPreviousPhrase}
            >
              Last sentence
            </button>
            <button
              type="button"
              className="rounded-xl bg-soft px-3 py-1.5 text-sm text-ink/70"
              onClick={() => {
                setLoop(null);
                seek(0);
                setPlaying(true);
              }}
            >
              Restart
            </button>
            {hasIntro ? (
              <button
                type="button"
                className={`rounded-xl px-3 py-1.5 text-sm ${
                  inIntro ? "bg-coral text-paper" : "bg-soft text-ink/70"
                }`}
                onClick={skipIntro}
              >
                Skip intro
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <section className="ami-card mt-4 px-4 py-4">
          <p className="quiet-label">Practice phrase</p>
          {practiceLine ? (
            <>
              <button
                type="button"
                className="mt-2 w-full rounded-2xl bg-soft/60 px-3 py-3 text-left transition hover:bg-soft"
                onClick={() => void hearFullSentence(practiceLine)}
                aria-label="Hear full sentence with AI"
              >
                <p className="font-display text-2xl text-ink" lang="vi">
                  {practiceLine.textVi}
                </p>
                <p className="mt-1 text-ink/60">{practiceLine.translationEn}</p>
                <p className="mt-2 text-xs text-coral">Tap sentence · AI reads the whole line</p>
              </button>
              <button
                type="button"
                className="teacher-btn-primary mt-3 w-full"
                onClick={() => void hearFullSentence(practiceLine)}
              >
                Hear full sentence (AI)
              </button>
              <button
                type="button"
                className="teacher-btn-secondary mt-2 w-full"
                onClick={() => void hearFullSentence(practiceLine, { slow: true })}
              >
                Hear sentence slowly
              </button>
              {hasIntro ? (
                <button
                  type="button"
                  className="teacher-btn-secondary mt-2 w-full"
                  onClick={skipIntro}
                >
                  Skip intro · jump to first phrase
                </button>
              ) : null}
              <button
                type="button"
                className="teacher-btn-secondary mt-2 w-full"
                onClick={rewindAndRepeatPhrase}
              >
                {loop ? "Replay this phrase with music" : "Repeat phrase with music"}
              </button>
              <button
                type="button"
                className="teacher-btn-secondary mt-2 w-full"
                onClick={repeatPreviousPhrase}
              >
                Last sentence + loop
              </button>
              {loop ? (
                <button
                  type="button"
                  className="teacher-btn-secondary mt-2 w-full"
                  onClick={() => {
                    stopSpeaking();
                    setLoop(null);
                  }}
                >
                  Stop repeating
                </button>
              ) : null}
              <div className="mt-4">
                <SingSpeakMic
                  phrase={practiceLine.textVi}
                  songId={song.id}
                  attemptIndex={0}
                  onScored={() => undefined}
                />
              </div>
              <LocalMicRecorder label="Optional singing take (local only)" />
            </>
          ) : (
            <p className="mt-2 text-sm text-ink/50">No lyric sentence available.</p>
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
