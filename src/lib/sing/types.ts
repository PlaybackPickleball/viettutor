export type SingMode = "listen" | "sing" | "speak";

export type LyricToken = {
  id: string;
  text: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  meaningEn: string;
  note?: string;
};

export type LyricLine = {
  id: string;
  tokens: LyricToken[];
  translationEn: string;
  start: number;
  end: number;
};

export type SingSong = {
  id: string;
  title: string;
  titleEn: string;
  artist: string;
  /** Authorization note for the library */
  license: string;
  durationSec: number;
  audioUrl: string;
  level: "beginner" | "elementary";
  tags: string[];
  summary: string;
  lines: LyricLine[];
};

export type SingProgress = {
  songId: string;
  modesCompleted: SingMode[];
  lastMode?: SingMode;
  vocabSaved: number;
  speakBestScore?: number;
  updatedAt: string;
};
