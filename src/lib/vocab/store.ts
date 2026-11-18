export type SavedVocabItem = {
  id: string;
  expression: string;
  meaningEn: string;
  originalSentence: string;
  sourceLessonId: string;
  savedAt: string;
  practiceCount: number;
  reviewStatus: "new" | "learning" | "review";
  /** YYYY-MM-DD when due for self-grade review; missing = due now. */
  due?: string;
  intervalDays?: number;
};

export type ReadingLessonDraft = {
  id: string;
  imageName?: string;
  rawOcr: string;
  correctedText: string;
  createdAt: string;
  provider: string;
  /** AI or demo sentence translation when available */
  translation?: string | null;
  /** AI-suggested tap segments with meanings */
  aiSegments?: { text: string; meaningEn: string; note?: string }[];
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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isSongVocab(item: SavedVocabItem): boolean {
  const src = item.sourceLessonId ?? "";
  return (
    src.startsWith("learn-lyrics:") ||
    src.startsWith("karaoke:") ||
    src.startsWith("sing:")
  );
}

export function dueVocab(items: SavedVocabItem[] = loadVocab(), today = todayKey()): SavedVocabItem[] {
  return items
    .filter((item) => !item.due || item.due <= today)
    .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? "") || a.savedAt.localeCompare(b.savedAt));
}

/** Self-grade flashcard: know → longer interval; again → due tomorrow. */
export function gradeVocabItem(
  id: string,
  grade: "know" | "again",
  today = todayKey(),
): SavedVocabItem[] {
  const list = loadVocab();
  const next = list.map((item) => {
    if (item.id !== id) return item;
    if (grade === "again") {
      return {
        ...item,
        practiceCount: item.practiceCount + 1,
        reviewStatus: "learning" as const,
        intervalDays: 1,
        due: addDays(today, 1),
      };
    }
    const intervalDays = Math.min(14, Math.max(1, (item.intervalDays ?? 0) || 1) * 2);
    return {
      ...item,
      practiceCount: item.practiceCount + 1,
      reviewStatus: "review" as const,
      intervalDays,
      due: addDays(today, intervalDays),
    };
  });
  localStorage.setItem(VOCAB_KEY, JSON.stringify(next));
  return next;
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
