/**
 * Dev / local-import helpers.
 * Licensed catalog songs may use device-local MP3s until hosted assets exist.
 * Unlicensed testing tracks also use this path. Never upload binaries to hosting.
 */

const KEY = "ami-lingua.sing-dev-mode.v1";

export function isSingDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(KEY) === "1") return true;
  } catch {
    /* */
  }
  return process.env.NODE_ENV === "development";
}

export function setSingDevMode(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, on ? "1" : "0");
}

/**
 * Licensed catalog songs that ship without git binaries — local import or VM seed.
 * Also the primary Dev Mode seed targets on this agent VM.
 */
export const LOCAL_ASSET_SONG_IDS = [
  "ngay-mai-nguoi-ta-lay-chong",
  "hat-mua-vuong-van",
] as const;

/** @deprecated alias — prefer LOCAL_ASSET_SONG_IDS */
export const DEV_REFERENCE_SONG_IDS = LOCAL_ASSET_SONG_IDS;

export type LocalAssetSongId = (typeof LOCAL_ASSET_SONG_IDS)[number];

export function isLocalAssetSong(songId: string): boolean {
  return (LOCAL_ASSET_SONG_IDS as readonly string[]).includes(songId);
}

export function isDevReferenceSong(songId: string): boolean {
  return isLocalAssetSong(songId);
}
