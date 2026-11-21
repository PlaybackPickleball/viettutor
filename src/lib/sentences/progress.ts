import { getEssentialLesson, listEssentialLessons } from "./catalog";
import {
  SENTENCE_STAGES,
  SENTENCE_XP,
  type SentenceStage,
  type SentencesProgressState,
} from "./types";

const STORAGE_KEY = "ami-lingua.essential-sentences.v1";

export function defaultSentencesProgress(): SentencesProgressState {
  return {
    version: 1,
    completedLessonIds: [],
    sentences: {},
    xpKeys: [],
    totalXp: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

export function loadSentencesProgress(): SentencesProgressState {
  if (typeof window === "undefined") return defaultSentencesProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSentencesProgress();
    const parsed = JSON.parse(raw) as Partial<SentencesProgressState>;
    return {
      version: 1,
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      sentences: parsed.sentences && typeof parsed.sentences === "object" ? parsed.sentences : {},
      xpKeys: Array.isArray(parsed.xpKeys) ? parsed.xpKeys : [],
      totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return defaultSentencesProgress();
  }
}

export function saveSentencesProgress(state: SentencesProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
  );
}

function award(state: SentencesProgressState, key: string, amount: number): SentencesProgressState {
  if (state.xpKeys.includes(key)) return state;
  return {
    ...state,
    xpKeys: [...state.xpKeys, key],
    totalXp: state.totalXp + amount,
  };
}

export function markStageDone(
  sentenceId: string,
  stage: SentenceStage,
  state = loadSentencesProgress(),
): SentencesProgressState {
  const prev = state.sentences[sentenceId] ?? {
    stagesDone: {},
    updatedAt: new Date().toISOString(),
  };
  const stagesDone = { ...prev.stagesDone, [stage]: true };
  const allDone = SENTENCE_STAGES.every((s) => stagesDone[s]);
  let next: SentencesProgressState = {
    ...state,
    sentences: {
      ...state.sentences,
      [sentenceId]: {
        ...prev,
        stagesDone,
        completedAt: allDone ? prev.completedAt ?? new Date().toISOString() : prev.completedAt,
        spokenAt: stage === "speak" ? new Date().toISOString() : prev.spokenAt,
        updatedAt: new Date().toISOString(),
      },
    },
  };
  if (allDone) {
    next = award(next, `sentence-complete:${sentenceId}`, SENTENCE_XP.sentenceComplete);
  }
  saveSentencesProgress(next);
  return next;
}

export function isSentenceComplete(
  sentenceId: string,
  state = loadSentencesProgress(),
): boolean {
  const rec = state.sentences[sentenceId];
  if (!rec) return false;
  return SENTENCE_STAGES.every((s) => rec.stagesDone[s]);
}

export function completeEssentialLesson(
  lessonId: string,
  state = loadSentencesProgress(),
): SentencesProgressState {
  const lesson = getEssentialLesson(lessonId);
  if (!lesson) return state;
  const all = lesson.sentenceIds.every((id) => isSentenceComplete(id, state));
  if (!all) return state;
  let next = state;
  if (!next.completedLessonIds.includes(lessonId)) {
    next = {
      ...next,
      completedLessonIds: [...next.completedLessonIds, lessonId],
    };
  }
  next = award(next, `lesson-complete:${lessonId}`, SENTENCE_XP.lessonComplete);
  saveSentencesProgress(next);
  return next;
}

export function isEssentialLessonUnlocked(
  lessonId: string,
  state = loadSentencesProgress(),
): boolean {
  const lessons = listEssentialLessons();
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return false;
  if (idx === 0) return true;
  return state.completedLessonIds.includes(lessons[idx - 1]!.id);
}

export function isEssentialLessonComplete(
  lessonId: string,
  state = loadSentencesProgress(),
): boolean {
  return state.completedLessonIds.includes(lessonId);
}
