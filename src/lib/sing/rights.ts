import type { AllowedUse, LicenseStatus, SingSong, SongRights } from "./types";

/** Default DENY when rights are missing or ambiguous. */
export function isLicenseActive(rights: SongRights, now = new Date()): boolean {
  if (rights.status !== "approved") return false;
  if (rights.expirationDate) {
    const exp = new Date(rights.expirationDate);
    if (!Number.isNaN(exp.getTime()) && exp.getTime() < now.getTime()) return false;
  }
  if (rights.effectiveDate) {
    const start = new Date(rights.effectiveDate);
    if (!Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) return false;
  }
  return true;
}

export function allowsUse(rights: SongRights, use: AllowedUse, now = new Date()): boolean {
  if (!rights.allowedUses.includes(use)) return false;
  // Metadata + external link are ok for pending catalog cards
  if (use === "metadata" || use === "external_link") {
    return rights.status !== "rejected";
  }
  return isLicenseActive(rights, now);
}

export function canShowCatalogCard(song: SingSong): boolean {
  return allowsUse(song.rights, "metadata");
}

export function canPlayAudio(song: SingSong): boolean {
  return Boolean(song.audioUrl) && allowsUse(song.rights, "audio_playback");
}

export function canShowLyrics(song: SingSong): boolean {
  return song.lines.length > 0 && allowsUse(song.rights, "lyrics_display");
}

export function canUseInstrumental(song: SingSong): boolean {
  return Boolean(song.instrumentalUrl) && allowsUse(song.rights, "karaoke_instrumental");
}

export function canRecordUgc(song: SingSong): boolean {
  return allowsUse(song.rights, "ugc_recording");
}

export function availabilityLabel(song: SingSong): string {
  const s = song.rights.status;
  if (canPlayAudio(song) && canShowLyrics(song)) return "Ready to learn";
  if (s === "pending") return "Rights pending";
  if (s === "under_review") return "Under review";
  if (s === "expired") return "License expired";
  if (s === "rejected") return "Unavailable";
  if (s === "approved" && !song.audioUrl) return "Assets pending upload";
  return "Unavailable";
}

export type AssetGateResult =
  | { ok: true; url: string }
  | { ok: false; status: number; reason: string; licenseStatus: LicenseStatus };

/**
 * Server-side gate: never return a protected URL unless the use is approved.
 */
export function gateSongAsset(
  song: SingSong | undefined,
  assetType: "audio_original" | "audio_instrumental" | "cover_art" | "lyric_timing",
): AssetGateResult {
  if (!song) {
    return { ok: false, status: 404, reason: "Song not found", licenseStatus: "rejected" };
  }
  if (assetType === "cover_art") {
    if (!song.coverUrl || !allowsUse(song.rights, "metadata")) {
      return {
        ok: false,
        status: 403,
        reason: "Cover art not authorized",
        licenseStatus: song.rights.status,
      };
    }
    return { ok: true, url: song.coverUrl };
  }
  if (assetType === "audio_original") {
    if (!canPlayAudio(song) || !song.audioUrl) {
      return {
        ok: false,
        status: 403,
        reason: "Audio playback not authorized",
        licenseStatus: song.rights.status,
      };
    }
    return { ok: true, url: song.audioUrl };
  }
  if (assetType === "audio_instrumental") {
    if (!canUseInstrumental(song) || !song.instrumentalUrl) {
      return {
        ok: false,
        status: 403,
        reason: "Instrumental not authorized",
        licenseStatus: song.rights.status,
      };
    }
    return { ok: true, url: song.instrumentalUrl };
  }
  if (assetType === "lyric_timing") {
    if (!canShowLyrics(song)) {
      return {
        ok: false,
        status: 403,
        reason: "Lyrics not authorized",
        licenseStatus: song.rights.status,
      };
    }
    return { ok: true, url: `/api/sing/lyrics?songId=${encodeURIComponent(song.id)}` };
  }
  return {
    ok: false,
    status: 400,
    reason: "Unknown asset type",
    licenseStatus: song.rights.status,
  };
}
