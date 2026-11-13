export type SavedVocabItem = {
  id: string;
  expression: string;
  meaningEn: string;
  originalSentence: string;
  sourceLessonId: string;
  savedAt: string;
  practiceCount: number;
  reviewStatus: "new" | "learning" | "review";
};

export type ReadingLessonDraft = {
  id: string;
  imageName?: string;
  rawOcr: string;
  correctedText: string;
  createdAt: string;
  provider: string;
};

const VOCAB_KEY = "ami-lingua.vocab.v1";
const LESSON_KEY = "ami-lingua.reading-lessons.v1";
const ACTIVE_LESSON_KEY = "ami-lingua.reading-active.v1";

export function loadVocab(): SavedVocabItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(VOCAB_KEY) || "[]") as SavedVocabItem[];
  } catch {
    return [];
  }
}

export function saveVocabItem(
  item: Omit<SavedVocabItem, "id" | "savedAt" | "practiceCount" | "reviewStatus">,
): SavedVocabItem[] {
  const list = loadVocab();
  const existing = list.find(
    (v) => v.expression.toLowerCase() === item.expression.toLowerCase(),
  );
  if (existing) {
    existing.practiceCount += 1;
    existing.meaningEn = item.meaningEn || existing.meaningEn;
    existing.originalSentence = item.originalSentence || existing.originalSentence;
    localStorage.setItem(VOCAB_KEY, JSON.stringify(list));
    return list;
  }
  const next: SavedVocabItem = {
    ...item,
    id: `vocab-${Date.now()}`,
    savedAt: new Date().toISOString(),
    practiceCount: 0,
    reviewStatus: "new",
  };
  const out = [next, ...list];
  localStorage.setItem(VOCAB_KEY, JSON.stringify(out));
  return out;
}

export function removeVocabItem(id: string): SavedVocabItem[] {
  const out = loadVocab().filter((v) => v.id !== id);
  localStorage.setItem(VOCAB_KEY, JSON.stringify(out));
  return out;
}

export function saveReadingLesson(lesson: ReadingLessonDraft) {
  if (typeof window === "undefined") return;
  const list = loadReadingLessons();
  const next = [lesson, ...list.filter((l) => l.id !== lesson.id)].slice(0, 30);
  localStorage.setItem(LESSON_KEY, JSON.stringify(next));
  localStorage.setItem(ACTIVE_LESSON_KEY, JSON.stringify(lesson));
}

export function loadReadingLessons(): ReadingLessonDraft[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LESSON_KEY) || "[]") as ReadingLessonDraft[];
  } catch {
    return [];
  }
}

export function loadActiveLesson(): ReadingLessonDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_LESSON_KEY);
    return raw ? (JSON.parse(raw) as ReadingLessonDraft) : null;
  } catch {
    return null;
  }
}
