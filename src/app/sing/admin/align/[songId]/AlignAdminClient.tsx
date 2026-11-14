"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { BilingualKaraokePlayer } from "@/components/karaoke/BilingualKaraokePlayer";
import { getKaraokeSong } from "@/lib/karaoke/catalog";
import { createDryRunJob, describePipeline, flagUncertainTokens } from "@/lib/karaoke/pipeline";
import type { KaraokeSong, LyricToken } from "@/lib/karaoke/types";
import { msToSec } from "@/lib/karaoke/types";

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

function saveDraft(song: KaraokeSong) {
  const all = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Record<string, KaraokeSong>;
  all[song.id] = song;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
}

export function AlignAdminClient({ songId }: { songId: string }) {
  const base = useMemo(() => getKaraokeSong(songId), [songId]);
  const [song, setSong] = useState<KaraokeSong | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [pipelineNote, setPipelineNote] = useState<string | null>(null);

  useEffect(() => {
    if (!base) return;
    setSong(loadDraft(songId) ?? structuredClone(base));
  }, [base, songId]);

  if (!base || !song) {
    return (
      <div className="studio-shell">
        <BrandMark />
        <p className="mt-6 text-sm text-ink/55">
          No approved karaoke document for <code>{songId}</code>. Generate offline, then register in{" "}
          <code>src/lib/karaoke/catalog.ts</code>.
        </p>
        <Link href="/sing/admin" className="teacher-btn-secondary mt-6 w-full text-center">
          Back to admin
        </Link>
      </div>
    );
  }

  const selected: LyricToken | null =
    song.lines.flatMap((l) => l.tokens).find((t) => t.id === tokenId) ?? null;

  function updateSelected(patch: Partial<LyricToken>) {
    if (!selected) return;
    setSong((prev) => {
      if (!prev) return prev;
      const next: KaraokeSong = {
        ...prev,
        lines: prev.lines.map((l) => ({
          ...l,
          tokens: l.tokens.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)),
          translationEn:
            l.id === selected.lineId && patch.contextualEnglish === undefined
              ? l.translationEn
              : l.translationEn,
        })),
      };
      return next;
    });
  }

  function updateLineTranslation(lineId: string, translationEn: string) {
    setSong((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lines: prev.lines.map((l) => (l.id === lineId ? { ...l, translationEn } : l)),
      };
    });
  }

  const uncertain = flagUncertainTokens(song);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Link href="/sing/admin" className="text-sm text-coral underline-offset-2 hover:underline">
          Admin
        </Link>
      </div>
      <p className="quiet-label mt-5">Song administration</p>
      <h1 className="mt-1 font-display text-2xl text-ink">Alignment editor</h1>
      <p className="mt-2 text-sm text-ink/55">
        Edit word boundaries (ms), translations, and preview sync. AI steps are offline — dry-run
        only here.
      </p>

      <section className="ami-card mt-5 px-4 py-4">
        <p className="quiet-label">Pipeline (offline)</p>
        <ul className="mt-2 space-y-1 text-xs text-ink/55">
          {describePipeline().map((s) => (
            <li key={s.step}>
              <span className="font-medium text-ink/70">{s.step}</span> · {s.provider}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="teacher-btn-secondary mt-3 w-full text-sm"
          onClick={() => {
            const job = createDryRunJob({
              songId: song.id,
              title: song.title,
              artist: song.artist,
              audioPath: song.audioUrl,
              verifiedLyricsVi: song.lines.map((l) => l.textVi),
              isolateVocals: true,
            });
            setPipelineNote(`Dry-run job ${job.id} created (${job.steps.length} steps). No models run.`);
          }}
        >
          Create alignment dry-run job
        </button>
        {pipelineNote ? <p className="mt-2 text-xs text-ink/45">{pipelineNote}</p> : null}
        {uncertain.length ? (
          <p className="mt-2 text-xs text-coral">
            {uncertain.length} token(s) flagged for timing review (confidence heuristic).
          </p>
        ) : (
          <p className="mt-2 text-xs text-ink/40">No uncertain timing flags on this draft.</p>
        )}
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Tokens</p>
        <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
          {song.lines.flatMap((l) =>
            l.tokens.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-2 py-1.5 text-left ${
                    tokenId === t.id ? "bg-coral/15" : "hover:bg-soft"
                  }`}
                  onClick={() => setTokenId(t.id)}
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
            <p className="text-xs text-ink/40">
              ≈ {msToSec(selected.startMs).toFixed(2)}s – {msToSec(selected.endMs).toFixed(2)}s
            </p>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          <p className="quiet-label">Line translations</p>
          {song.lines.map((l) => (
            <div key={l.id}>
              <p className="text-sm text-ink" lang="vi">
                {l.textVi}
              </p>
              <input
                className="ami-card mt-1 w-full px-3 py-2 text-sm"
                value={l.translationEn}
                onChange={(e) => updateLineTranslation(l.id, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="teacher-btn-primary mt-4 w-full"
          onClick={() => {
            saveDraft(song);
            setPipelineNote("Draft saved on this device (localStorage). Publish still uses catalog fixture until merged.");
          }}
        >
          Save alignment draft locally
        </button>
      </section>

      <p className="quiet-label mt-6">Preview</p>
      <BilingualKaraokePlayer song={song} />

      <Link href={`/sing/${song.id}`} className="teacher-btn-secondary mt-6 w-full text-center">
        Open learner player
      </Link>
    </div>
  );
}
