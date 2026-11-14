"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { listCatalogSongs } from "@/lib/sing/catalog";
import {
  loadRightsAudit,
  loadStudioDrafts,
  proposeOriginalLyrics,
  saveStudioDraft,
  type RightsAuditEntry,
} from "@/lib/sing/studio";
import type {
  Difficulty,
  Dialect,
  LicenseStatus,
  MusicStudioDraft,
  MusicStyle,
  VocalType,
} from "@/lib/sing/types";

export function SingAdminClient() {
  const [drafts, setDrafts] = useState<MusicStudioDraft[]>([]);
  const [audit, setAudit] = useState<RightsAuditEntry[]>([]);
  const [topic, setTopic] = useState("Ordering a drink in a café");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [dialect, setDialect] = useState<Dialect>("southern");
  const [style, setStyle] = useState<MusicStyle>("acoustic-pop");
  const [voiceType, setVoiceType] = useState<VocalType>("female");
  const [durationSec, setDurationSec] = useState(30);
  const [objective, setObjective] = useState("Useful café phrases with clear tones");
  const [lyricsVi, setLyricsVi] = useState("");
  const [lyricsEn, setLyricsEn] = useState("");
  const [notes, setNotes] = useState("");

  function refresh() {
    setDrafts(loadStudioDrafts());
    setAudit(loadRightsAudit());
  }

  useEffect(() => {
    refresh();
  }, []);

  function generateLyrics() {
    const proposed = proposeOriginalLyrics(topic);
    setLyricsVi(proposed.vi);
    setLyricsEn(proposed.en);
  }

  function saveDraft(partial?: Partial<MusicStudioDraft>) {
    const draft: MusicStudioDraft = {
      id: `studio-${Date.now()}`,
      language: "vi",
      dialect,
      difficulty,
      topic,
      style,
      durationSec,
      voiceType,
      objective,
      proposedLyricsVi: lyricsVi,
      proposedLyricsEn: lyricsEn,
      teacherApproved: false,
      audioUploaded: false,
      rightsStatus: "pending" as LicenseStatus,
      createdAt: new Date().toISOString(),
      notes,
      ...partial,
    };
    // If updating existing via partial.id
    if (partial?.id) draft.id = partial.id;
    saveStudioDraft(draft);
    refresh();
  }

  const songs = listCatalogSongs();

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Link href="/sing" className="text-sm text-coral underline-offset-2 hover:underline">
          Library
        </Link>
      </div>

      <p className="quiet-label mt-5">Protected</p>
      <h1 className="mt-1 font-display text-3xl text-ink">ÁMi Music Studio</h1>
      <p className="mt-2 text-sm text-ink/60">
        Admin workflow for original educational songs and rights documentation. Never upload
        unlicensed commercial masters or lyrics.
      </p>

      <section className="ami-card mt-6 px-4 py-5">
        <h2 className="font-display text-xl text-ink">Bilingual karaoke alignment</h2>
        <p className="mt-2 text-sm text-ink/55">
          Edit ms boundaries, translations, and preview Learn/Sing/Practice. AI (Demucs / WhisperX /
          LLM) stays offline — playback uses approved JSON only.
        </p>
        <Link
          href="/sing/admin/align/xin-chao-moi-ngay"
          className="teacher-btn-primary mt-4 block w-full text-center"
        >
          Open Xin chào mỗi ngày alignment
        </Link>
      </section>

      <section className="ami-card mt-5 px-4 py-5">
        <h2 className="font-display text-xl text-ink">Catalog rights</h2>
        <ul className="mt-3 space-y-3">
          {songs.map((s) => (
            <li key={s.id} className="border-b border-[#e8d9c8] pb-3 last:border-0">
              <p className="font-medium text-ink" lang="vi">
                {s.title}
              </p>
              <p className="text-xs text-ink/50">
                {s.rights.status} · uses: {s.rights.allowedUses.join(", ")}
              </p>
              <p className="mt-1 text-xs text-ink/40">{s.rights.documentationRef}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink/40">
          Pending commercial titles stay metadata-only until legal clearance. Server asset routes
          default to DENY.
        </p>
      </section>

      <section className="ami-card mt-5 px-4 py-5">
        <h2 className="font-display text-xl text-ink">Create original song</h2>
        <p className="mt-1 text-sm text-ink/55">
          Step 1–3 of the generation workflow: objectives → original lyrics → teacher review. Music
          generation API is configurable later; MVP accepts a manual approved audio upload note.
        </p>

        <label className="quiet-label mt-4 block">Topic / vocabulary</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="ami-card mt-1 w-full px-3 py-2 text-sm"
        />

        <label className="quiet-label mt-3 block">Learning objective</label>
        <input
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          className="ami-card mt-1 w-full px-3 py-2 text-sm"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <select
            className="ami-card px-2 py-2 text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="beginner">Beginner</option>
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
          </select>
          <select
            className="ami-card px-2 py-2 text-sm"
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
          >
            <option value="southern">Southern</option>
            <option value="northern">Northern</option>
            <option value="neutral">Neutral</option>
          </select>
          <select
            className="ami-card px-2 py-2 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value as MusicStyle)}
          >
            <option value="acoustic-pop">Acoustic pop</option>
            <option value="educational">Educational</option>
            <option value="folk">Folk</option>
            <option value="ballad">Ballad</option>
          </select>
          <select
            className="ami-card px-2 py-2 text-sm"
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value as VocalType)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <label className="quiet-label mt-3 block">Target duration (seconds)</label>
        <input
          type="number"
          min={15}
          max={120}
          value={durationSec}
          onChange={(e) => setDurationSec(Number(e.target.value) || 30)}
          className="ami-card mt-1 w-full px-3 py-2 text-sm"
        />

        <button type="button" className="teacher-btn-secondary mt-4 w-full" onClick={generateLyrics}>
          Propose original Vietnamese lyrics
        </button>

        <label className="quiet-label mt-4 block">Lyrics (VI) — original only</label>
        <textarea
          value={lyricsVi}
          onChange={(e) => setLyricsVi(e.target.value)}
          rows={5}
          className="ami-card mt-1 w-full px-3 py-2 text-sm"
          lang="vi"
        />
        <label className="quiet-label mt-3 block">Lyrics (EN)</label>
        <textarea
          value={lyricsEn}
          onChange={(e) => setLyricsEn(e.target.value)}
          rows={4}
          className="ami-card mt-1 w-full px-3 py-2 text-sm"
        />

        <label className="quiet-label mt-3 block">Admin / teacher notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="ami-card mt-1 w-full px-3 py-2 text-sm"
          placeholder="Teacher corrections, provider, download entitlement…"
        />

        <button
          type="button"
          className="teacher-btn-primary mt-4 w-full"
          onClick={() => saveDraft()}
          disabled={!lyricsVi.trim()}
        >
          Save studio draft
        </button>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl text-ink">Studio drafts</h2>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-ink/45">No drafts yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {drafts.map((d) => (
              <li key={d.id} className="ami-card px-4 py-4">
                <p className="font-medium text-ink">{d.topic}</p>
                <p className="text-xs text-ink/45">
                  {d.difficulty} · {d.dialect} · {d.rightsStatus}
                  {d.teacherApproved ? " · teacher ✓" : ""}
                  {d.audioUploaded ? " · audio noted" : ""}
                </p>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-ink/70" lang="vi">
                  {d.proposedLyricsVi}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="teacher-btn-secondary py-1.5 text-sm"
                    onClick={() => {
                      saveStudioDraft({ ...d, teacherApproved: true, rightsStatus: "under_review" });
                      refresh();
                    }}
                  >
                    Mark teacher approved
                  </button>
                  <button
                    type="button"
                    className="teacher-btn-secondary py-1.5 text-sm"
                    onClick={() => {
                      saveStudioDraft({
                        ...d,
                        audioUploaded: true,
                        notes: `${d.notes}\nManual approved audio upload recorded ${new Date().toISOString()}`,
                      });
                      refresh();
                    }}
                  >
                    Note manual audio upload
                  </button>
                  <button
                    type="button"
                    className="teacher-btn-amber py-1.5 text-sm"
                    onClick={() => {
                      saveStudioDraft({ ...d, rightsStatus: "approved" });
                      refresh();
                    }}
                  >
                    Mark rights approved
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Rights audit trail</h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-sm text-ink/45">No audit events yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-xs text-ink/55">
            {audit.slice(0, 20).map((a, i) => (
              <li key={`${a.at}-${i}`}>
                {a.at} · {a.action} · {a.songId} · {a.status}
                {a.note ? ` · ${a.note}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/sing" className="teacher-btn-secondary mt-8 w-full text-center">
        Back to Sing
      </Link>
    </div>
  );
}
