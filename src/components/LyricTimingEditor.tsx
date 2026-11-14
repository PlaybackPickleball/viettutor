"use client";

import { useState } from "react";
import {
  markLineEnd,
  markLineStart,
  parseUserLyricText,
  saveLocalLyrics,
  type LocalLyricDraft,
} from "@/lib/sing/localLyrics";
import type { LyricLine } from "@/lib/sing/types";
import { formatKaraokeTime } from "@/components/KaraokePlayer";

type Props = {
  songId: string;
  durationSec: number;
  currentTime: number;
  draft: LocalLyricDraft | null;
  onSaved: (draft: LocalLyricDraft) => void;
};

/**
 * Private local lyric-timing editor.
 * Accepts only user-supplied text — never fetches commercial lyrics.
 */
export function LyricTimingEditor({
  songId,
  durationSec,
  currentTime,
  draft,
  onSaved,
}: Props) {
  const [rawVi, setRawVi] = useState(draft?.rawVi ?? "");
  const [rawEn, setRawEn] = useState(draft?.rawEn ?? "");
  const [lines, setLines] = useState<LyricLine[]>(draft?.lines ?? []);
  const [activeLineId, setActiveLineId] = useState<string | null>(
    draft?.lines[0]?.id ?? null,
  );
  const [open, setOpen] = useState(!(draft?.lines.length));

  function rebuildFromText() {
    const next = parseUserLyricText(rawVi, rawEn, durationSec);
    setLines(next);
    setActiveLineId(next[0]?.id ?? null);
  }

  function persist(nextLines: LyricLine[]) {
    const saved: LocalLyricDraft = {
      songId,
      rawVi,
      rawEn,
      lines: nextLines,
      updatedAt: new Date().toISOString(),
    };
    saveLocalLyrics(saved);
    setLines(nextLines);
    onSaved(saved);
  }

  function saveAll() {
    const next = lines.length ? lines : parseUserLyricText(rawVi, rawEn, durationSec);
    persist(next);
    setOpen(false);
  }

  return (
    <section className="ami-card mt-5 px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="quiet-label">Local lyric timing</p>
          <h2 className="mt-1 font-display text-xl text-ink">Timing editor</h2>
        </div>
        <button
          type="button"
          className="text-sm text-coral underline-offset-2 hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Edit"}
        </button>
      </div>
      <p className="mt-2 text-sm text-ink/55">
        Paste lyrics you are authorized to type. Timings stay on this device only.
      </p>

      {open ? (
        <>
          <label className="quiet-label mt-4 block">Vietnamese (one line per lyric)</label>
          <textarea
            value={rawVi}
            onChange={(e) => setRawVi(e.target.value)}
            rows={6}
            className="ami-card mt-1 w-full px-3 py-2 text-sm"
            lang="vi"
            placeholder={"Xin chào bạn ơi\nTôi học tiếng Việt"}
          />
          <label className="quiet-label mt-3 block">English (optional, same line count)</label>
          <textarea
            value={rawEn}
            onChange={(e) => setRawEn(e.target.value)}
            rows={4}
            className="ami-card mt-1 w-full px-3 py-2 text-sm"
            placeholder={"Hello dear friend\nI am learning Vietnamese"}
          />
          <button
            type="button"
            className="teacher-btn-secondary mt-3 w-full"
            onClick={rebuildFromText}
          >
            Build lines from text
          </button>

          {lines.length ? (
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {lines.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                      activeLineId === l.id ? "bg-coral/15 ring-1 ring-coral/40" : "bg-soft"
                    }`}
                    onClick={() => setActiveLineId(l.id)}
                  >
                    <span lang="vi" className="font-medium text-ink">
                      {l.tokens.map((t) => t.text).join(" ")}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink/45">
                      {formatKaraokeTime(l.start)} – {formatKaraokeTime(l.end)}
                      {l.translationEn ? ` · ${l.translationEn}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-3 text-xs text-ink/45">
            Playhead {formatKaraokeTime(currentTime)} — select a line, then mark start/end.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="teacher-btn-secondary flex-1 py-2 text-sm"
              disabled={!activeLineId}
              onClick={() => {
                if (!activeLineId) return;
                persist(markLineStart(lines, activeLineId, currentTime));
              }}
            >
              Mark start
            </button>
            <button
              type="button"
              className="teacher-btn-secondary flex-1 py-2 text-sm"
              disabled={!activeLineId}
              onClick={() => {
                if (!activeLineId) return;
                persist(markLineEnd(lines, activeLineId, currentTime));
              }}
            >
              Mark end
            </button>
          </div>
          <button type="button" className="teacher-btn-primary mt-3 w-full" onClick={saveAll}>
            Save timings on this device
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-ink/50">
          {draft?.lines.length
            ? `${draft.lines.length} local lines saved.`
            : "No local lyrics yet."}
        </p>
      )}
    </section>
  );
}
