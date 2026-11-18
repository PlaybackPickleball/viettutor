"use client";

import { useEffect, useMemo, useState } from "react";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { WordLessonPanel } from "@/components/karaoke/WordLessonPanel";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import { msToSec } from "@/lib/karaoke/types";
import type { KaraokeSong, LyricLine, LyricToken } from "@/lib/karaoke/types";
import {
  bumpLearnVocab,
  getLearnLyricsProgress,
  learnLyricsMastery,
  markLearnLineComplete,
  markLearnLineSpoken,
  setLearnLastLine,
  type LearnLyricsSongProgress,
} from "@/lib/sing/learnLyrics/progress";

type Props = {
  song: KaraokeSong;
  /** Jump back to Sing karaoke at this line’s audio start (seconds). */
  onReturnToSing?: (audioSec: number, lineId: string) => void;
};

export function LearnTheLyrics({ song, onReturnToSing }: Props) {
  const lines = song.lines;
  const [progress, setProgress] = useState<LearnLyricsSongProgress | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<LyricToken | null>(null);
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState(false);

  useEffect(() => {
    const p = getLearnLyricsProgress(song.id);
    setProgress(p);
    const resume =
      p.lastLineId != null ? lines.findIndex((l) => l.id === p.lastLineId) : 0;
    setIndex(resume >= 0 ? resume : 0);
    setSelected(null);
    setHeard(false);
  }, [song.id, lines]);

  const line: LyricLine | undefined = lines[index];
  const mastery = useMemo(
    () => learnLyricsMastery(song.id, lines.length),
    // refresh when progress updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [song.id, lines.length, progress],
  );

  useEffect(() => {
    if (!line) return;
    setLearnLastLine(song.id, line.id);
    setSelected(null);
    setHeard(false);
  }, [line?.id, song.id]);

  function refresh() {
    setProgress(getLearnLyricsProgress(song.id));
  }

  async function listen(slow = false) {
    if (!line?.textVi) return;
    setBusy(true);
    try {
      await speakVietnamese(line.textVi, {
        slow,
        rate: slow ? 0.72 : 0.9,
      });
      setHeard(true);
    } catch {
      setHeard(true);
    } finally {
      setBusy(false);
    }
  }

  function go(delta: number) {
    stopSpeaking();
    setIndex((i) => Math.min(lines.length - 1, Math.max(0, i + delta)));
  }

  function completeLine() {
    if (!line) return;
    markLearnLineComplete(song.id, line.id);
    refresh();
  }

  function onRecorded() {
    if (!line) return;
    markLearnLineSpoken(song.id, line.id);
    refresh();
  }

  function returnToSing() {
    if (!line || !onReturnToSing) return;
    const offsetSec = msToSec(song.globalOffsetMs ?? 0);
    const audioSec = Math.max(0, msToSec(line.startMs) + offsetSec);
    onReturnToSing(audioSec, line.id);
  }

  if (!line) {
    return <p className="mt-6 text-ink/50">No lyric lines for this song.</p>;
  }

  const done = progress?.completedLineIds.includes(line.id) ?? false;

  return (
    <div className="mt-4 animate-riseIn">
      <div className="ami-card px-4 py-4">
        <div className="mb-1 flex justify-between text-sm text-ink/60">
          <span>Learn the Lyrics</span>
          <span>
            {index + 1}/{lines.length} · {mastery.pct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${mastery.pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink/45">
          {mastery.completed} sentences done · {mastery.spoken} spoken · {mastery.vocabSaved} words
          saved
        </p>
      </div>

      <div className="ami-card mt-4 px-4 py-6 text-center">
        <p className="quiet-label">Sentence {index + 1}</p>
        <p
          className="mt-3 font-hand text-3xl font-medium leading-snug text-ink sm:text-4xl"
          lang="vi"
        >
          {line.tokens.map((tok) => {
            const on = selected?.id === tok.id;
            return (
              <button
                key={tok.id}
                type="button"
                onClick={() => setSelected(tok)}
                className={`mx-0.5 inline rounded-lg px-1 py-0.5 transition ${
                  on ? "bg-coral text-paper" : "hover:bg-amber/20"
                }`}
                lang="vi"
              >
                {tok.text}
              </button>
            );
          })}
        </p>
        <p className="mt-4 text-base text-ink/65">{line.translationEn || "—"}</p>
        <p className="mt-2 text-[11px] text-ink/35">
          Real lyric line from the song — tap a word for meaning, tone, and Đánh Vần.
        </p>
      </div>

      {selected ? (
        <WordLessonPanel
          token={selected}
          line={line}
          songId={song.id}
          onClose={() => setSelected(null)}
          onSavedVocab={() => {
            bumpLearnVocab(song.id);
            refresh();
          }}
        />
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="teacher-btn-primary"
          disabled={busy}
          onClick={() => void listen(false)}
        >
          {busy ? "Playing…" : "Listen"}
        </button>
        <button
          type="button"
          className="teacher-btn-secondary"
          disabled={busy}
          onClick={() => void listen(true)}
        >
          Slow
        </button>
        <button type="button" className="teacher-btn-secondary" onClick={() => stopSpeaking()}>
          Stop
        </button>
        {onReturnToSing ? (
          <button type="button" className="teacher-btn-amber" onClick={returnToSing}>
            Sing this phrase
          </button>
        ) : null}
      </div>

      <div className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Speak the sentence</p>
        <p className="mt-1 text-xs text-ink/45">
          Record and compare to the teacher model. No invented scores.
        </p>
        <LocalMicRecorder
          label="Record this sentence (local only — no pitch score)"
          onRecorded={onRecorded}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="teacher-btn-secondary"
          disabled={index <= 0}
          onClick={() => go(-1)}
        >
          Prev
        </button>
        <button
          type="button"
          className="teacher-btn-secondary"
          disabled={index >= lines.length - 1}
          onClick={() => go(1)}
        >
          Next
        </button>
        <button
          type="button"
          className={`teacher-btn-primary flex-1 ${heard || done ? "" : "opacity-50"}`}
          disabled={!heard && !done}
          onClick={() => {
            completeLine();
            if (index < lines.length - 1) go(1);
          }}
        >
          {done ? "Done ★ · Next" : "Mark done · Next"}
        </button>
      </div>
    </div>
  );
}
