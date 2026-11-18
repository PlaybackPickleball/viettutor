"use client";

import { useMemo, useState } from "react";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import { resolveSequence, sequenceLabel } from "@/lib/phonics";
import type { LyricLine, LyricToken } from "@/lib/karaoke/types";
import { saveVocabItem } from "@/lib/vocab/store";

type Props = {
  token: LyricToken;
  line: LyricLine;
  songId: string;
  onSavedVocab?: () => void;
  onClose?: () => void;
};

export function WordLessonPanel({ token, line, songId, onSavedVocab, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [showBreak, setShowBreak] = useState(false);

  const steps = useMemo(() => resolveSequence(token.text), [token.text]);
  const tone = token.toneMetadata?.label ?? "unknown";
  const meaning = token.contextualEnglish?.trim() || "—";

  async function speak(slow = false) {
    setBusy(true);
    try {
      await speakVietnamese(token.text, { slow });
    } catch {
      /* */
    } finally {
      setBusy(false);
    }
  }

  async function playBreakdown() {
    if (!steps?.length) return;
    setBusy(true);
    setShowBreak(true);
    try {
      for (const step of steps) {
        await speakVietnamese(step.utterance, { slow: true });
        await new Promise((r) => setTimeout(r, 220));
      }
    } catch {
      /* */
    } finally {
      setBusy(false);
    }
  }

  function saveWord() {
    saveVocabItem({
      expression: token.text,
      meaningEn: meaning === "—" ? token.text : meaning,
      originalSentence: line.textVi,
      sourceLessonId: `learn-lyrics:${songId}`,
    });
    onSavedVocab?.();
  }

  return (
    <div className="ami-card mt-4 px-4 py-4 animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="quiet-label">Word</p>
          <p className="mt-1 font-hand text-4xl font-medium text-ink" lang="vi">
            {token.text}
          </p>
        </div>
        {onClose ? (
          <button type="button" className="teacher-btn-secondary py-1.5 px-3 text-sm" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink/45">Meaning</dt>
          <dd className="text-right text-ink">{meaning}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink/45">Tone</dt>
          <dd className="text-right text-ink" lang="vi">
            {tone}
          </dd>
        </div>
        {token.toneMetadata?.note ? (
          <p className="text-xs text-ink/45">{token.toneMetadata.note}</p>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="teacher-btn-primary py-2 text-sm"
          disabled={busy}
          onClick={() => void speak(false)}
        >
          Pronounce
        </button>
        <button
          type="button"
          className="teacher-btn-secondary py-2 text-sm"
          disabled={busy}
          onClick={() => void speak(true)}
        >
          Slow
        </button>
        <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={() => stopSpeaking()}>
          Stop
        </button>
        <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={saveWord}>
          Save word
        </button>
      </div>

      <div className="mt-4 border-t border-[#e8d9c8] pt-4">
        <p className="quiet-label">Đánh Vần</p>
        {steps?.length ? (
          <>
            <p className="mt-1 text-sm text-ink/70" lang="vi">
              {sequenceLabel(steps)}
            </p>
            <button
              type="button"
              className="teacher-btn-secondary mt-2 py-2 text-sm"
              disabled={busy}
              onClick={() => void playBreakdown()}
            >
              Break it down
            </button>
            {showBreak ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {steps.map((s, i) => (
                  <span
                    key={`${s.display}-${i}`}
                    className="rounded-xl bg-soft px-2.5 py-1.5 text-center"
                    lang="vi"
                  >
                    <span className="block font-hand text-xl leading-none">{s.display}</span>
                    <span className="text-[10px] text-ink/50">{s.utterance}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-1 text-sm text-ink/50">
            No verified Đánh Vần sequence for this syllable yet — listen and compare by ear.
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-[#e8d9c8] pt-4">
        <p className="quiet-label">Practice</p>
        <p className="mt-1 text-xs text-ink/45">Record and replay — no automatic score.</p>
        <LocalMicRecorder label={`Record “${token.text}”`} />
      </div>

      <p className="mt-3 text-[11px] text-ink/40" lang="vi">
        In sentence: {line.textVi}
      </p>
    </div>
  );
}
