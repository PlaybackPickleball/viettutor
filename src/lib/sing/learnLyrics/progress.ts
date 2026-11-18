/** Learn-the-Lyrics progress — segment completion, no AI scores. */

export type LearnLyricsSongProgress = {
  songId: string;
  /** Line ids the learner marked complete */
  completedLineIds: string[];
  /** Lines where they recorded at least once */
  spokenLineIds: string[];
  lastLineId: string | null;
  vocabSaved: number;
  updatedAt: string;
};

const KEY = "ami-lingua.learn-lyrics.v1";

function empty(songId: string): LearnLyricsSongProgress {
  return {
    songId,
    completedLineIds: [],
    spokenLineIds: [],
    lastLineId: null,
    vocabSaved: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function loadLearnLyricsAll(): Record<string, LearnLyricsSongProgress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      LearnLyricsSongProgress
    >;
  } catch {
    return {};
  }
}

export function getLearnLyricsProgress(songId: string): LearnLyricsSongProgress {
  return loadLearnLyricsAll()[songId] ?? empty(songId);
}

function save(songId: string, next: LearnLyricsSongProgress) {
  if (typeof window === "undefined") return;
  const all = loadLearnLyricsAll();
  all[songId] = { ...next, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function setLearnLastLine(songId: string, lineId: string) {
  const prev = getLearnLyricsProgress(songId);
  save(songId, { ...prev, lastLineId: lineId });
}

export function markLearnLineSpoken(songId: string, lineId: string) {
  const prev = getLearnLyricsProgress(songId);
  const spokenLineIds = prev.spokenLineIds.includes(lineId)
    ? prev.spokenLineIds
    : [...prev.spokenLineIds, lineId];
  save(songId, { ...prev, spokenLineIds, lastLineId: lineId });
}

export function markLearnLineComplete(songId: string, lineId: string) {
  const prev = getLearnLyricsProgress(songId);
  const completedLineIds = prev.completedLineIds.includes(lineId)
    ? prev.completedLineIds
    : [...prev.completedLineIds, lineId];
  save(songId, { ...prev, completedLineIds, lastLineId: lineId });
}

export function bumpLearnVocab(songId: string) {
  const prev = getLearnLyricsProgress(songId);
  save(songId, { ...prev, vocabSaved: prev.vocabSaved + 1 });
}

export function learnLyricsMastery(songId: string, totalLines: number) {
  const p = getLearnLyricsProgress(songId);
  const completed = p.completedLineIds.length;
  return {
    completed,
    total: totalLines,
    pct: totalLines === 0 ? 0 : Math.round((completed / totalLines) * 100),
    spoken: p.spokenLineIds.length,
    vocabSaved: p.vocabSaved,
    lastLineId: p.lastLineId,
  };
}
