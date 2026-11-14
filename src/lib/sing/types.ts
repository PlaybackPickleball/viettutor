/** ÁMi Sing — shared types */

/** Listen → Understand → Sing → Speak → Improve */
export type SingMode = "listen" | "understand" | "sing" | "speak" | "improve";

export type LicenseStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "expired"
  | "rejected";

export type VocalType = "male" | "female" | "mixed" | "instrumental";

export type Difficulty = "beginner" | "elementary" | "intermediate" | "advanced";

export type MusicStyle =
  | "acoustic-pop"
  | "ballad"
  | "folk"
  | "educational"
  | "other";

export type Dialect = "southern" | "northern" | "neutral";

export type AllowedUse =
  | "metadata"
  | "external_link"
  | "audio_playback"
  | "lyrics_display"
  | "karaoke_instrumental"
  | "synchronization"
  | "ugc_recording"
  | "commercial";

export type LyricToken = {
  id: string;
  text: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  meaningEn: string;
  note?: string;
  toneHint?: string;
  partOfSpeech?: string;
};

export type LyricLine = {
  id: string;
  tokens: LyricToken[];
  translationEn: string;
  start: number;
  end: number;
};

export type SongRights = {
  status: LicenseStatus;
  compositionOwner?: string;
  masterOwner?: string;
  publisher?: string;
  territory: string;
  allowedUses: AllowedUse[];
  effectiveDate?: string;
  expirationDate?: string;
  documentationRef?: string;
  /** Human-readable note shown in UI */
  note: string;
};

export type SingSong = {
  id: string;
  title: string;
  titleEn: string;
  artist: string;
  songwriter?: string;
  language: "vi";
  genre: string;
  style: MusicStyle;
  vocalType: VocalType;
  difficulty: Difficulty;
  dialect: Dialect;
  durationSec: number;
  estimatedLessonMin: number;
  tags: string[];
  skills: string[];
  summary: string;
  category: string;
  /** Cover art path — only when licensed/original */
  coverUrl?: string;
  /** Authorized audio — only when rights allow playback */
  audioUrl?: string;
  instrumentalUrl?: string;
  /** External listen link (Spotify/YouTube etc.) — leaves the app */
  externalListenUrl?: string;
  rights: SongRights;
  /** Timed lyrics — only when lyrics_display is approved */
  lines: LyricLine[];
  featured?: boolean;
  source: "original" | "licensed" | "pending_catalog";
};

export type SingProgress = {
  songId: string;
  modesCompleted: SingMode[];
  lastMode?: SingMode;
  lastPositionMs?: number;
  vocabSaved: number;
  speakBestScore?: number;
  saved?: boolean;
  updatedAt: string;
};

export type PracticeHistoryEntry = {
  id: string;
  songId: string;
  songTitle: string;
  mode: SingMode;
  at: string;
};

export type MusicStudioDraft = {
  id: string;
  language: "vi";
  dialect: Dialect;
  difficulty: Difficulty;
  topic: string;
  style: MusicStyle;
  durationSec: number;
  voiceType: VocalType;
  objective: string;
  proposedLyricsVi: string;
  proposedLyricsEn: string;
  teacherApproved: boolean;
  audioUploaded: boolean;
  rightsStatus: LicenseStatus;
  createdAt: string;
  notes: string;
};
