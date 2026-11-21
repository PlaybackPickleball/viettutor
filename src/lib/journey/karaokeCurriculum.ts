/**
 * Karaoke curriculum hooks — licensed / rights-approved songs only.
 * Does not rewrite Sing playback; deep-links into existing `/sing/[id]`.
 */

import { listKaraokeSongs } from "@/lib/karaoke/catalog";
import { getSong } from "@/lib/sing/catalog";
import { canPlayAudio, canShowLyrics, rightsAllowPlayback } from "@/lib/sing/rights";
import type { SingSong } from "@/lib/sing/types";
import { loadSingProgress } from "@/lib/sing/progress";

export type KaraokeCurriculumHook = {
  id: string;
  songId: string;
  titleEn: string;
  titleVi: string;
  blurb: string;
  /** Soft recommend after this journey unit (does not hard-gate Sing). */
  afterUnitId: string;
  focusEn: string;
  href: string;
  source: SingSong["source"];
};

/**
 * Curated journey ↔ song map. Only song ids that pass {@link isCurriculumKaraokeEligible}
 * are returned by {@link listKaraokeCurriculumHooks}.
 */
const CURRICULUM_HOOK_DEFS: Omit<KaraokeCurriculumHook, "source" | "href">[] = [
  {
    id: "hook-xin-chao",
    songId: "xin-chao-moi-ngay",
    titleEn: "Greetings in song",
    titleVi: "Xin chào mỗi ngày",
    blurb: "Practice hello & everyday greetings after Discover — ÁMi original, rights approved.",
    afterUnitId: "u1",
    focusEn: "Greetings · xin chào",
  },
  {
    id: "hook-hat-mua",
    songId: "hat-mua-vuong-van",
    titleEn: "Listen · rain ballad",
    titleVi: "Hạt mưa vương vấn",
    blurb: "Licensed elementary ballad — listen & follow lines after tones.",
    afterUnitId: "u2",
    focusEn: "Listening · Southern pronunciation",
  },
  {
    id: "hook-ngay-mai",
    songId: "ngay-mai-nguoi-ta-lay-chong",
    titleEn: "Emotion in lyrics",
    titleVi: "Ngày mai người ta lấy chồng",
    blurb: "Licensed emotional ballad — comprehension after early Đánh Vần.",
    afterUnitId: "u3",
    focusEn: "Emotion · longer phrases",
  },
];

/** Eligible = approved karaoke doc + Sing rights allow playback (licensed or original). */
export function isCurriculumKaraokeEligible(songId: string): boolean {
  const karaoke = listKaraokeSongs().find((s) => s.id === songId);
  if (!karaoke || karaoke.publishStatus !== "approved") return false;
  const song = getSong(songId);
  if (!song) return false;
  if (song.source !== "licensed" && song.source !== "original") return false;
  if (!rightsAllowPlayback(song)) return false;
  // Prefer playable catalog entries; karaoke-ready without hosted audio still OK if lyrics gate passes.
  return canPlayAudio(song) || canShowLyrics(song) || Boolean(karaoke.audioUrl);
}

export function listKaraokeCurriculumHooks(): KaraokeCurriculumHook[] {
  const out: KaraokeCurriculumHook[] = [];
  for (const def of CURRICULUM_HOOK_DEFS) {
    if (!isCurriculumKaraokeEligible(def.songId)) continue;
    const song = getSong(def.songId)!;
    out.push({
      ...def,
      source: song.source,
      href: `/sing/${def.songId}`,
    });
  }
  return out;
}

export function getKaraokeCurriculumHook(hookId: string): KaraokeCurriculumHook | undefined {
  return listKaraokeCurriculumHooks().find((h) => h.id === hookId);
}

export function hookForSong(songId: string): KaraokeCurriculumHook | undefined {
  return listKaraokeCurriculumHooks().find((h) => h.songId === songId);
}

/** Soft progress: any Sing mode stamp on the song. */
export function isKaraokeHookTouched(songId: string): boolean {
  const sing = loadSingProgress();
  return (sing[songId]?.modesCompleted?.length ?? 0) > 0;
}

export function nextUntouchedKaraokeHook(): KaraokeCurriculumHook | undefined {
  return listKaraokeCurriculumHooks().find((h) => !isKaraokeHookTouched(h.songId));
}
