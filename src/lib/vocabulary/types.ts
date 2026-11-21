/** First-100 illustrated vocabulary pack (Nicola). */

export type PackWord = {
  id: string;
  packId: number;
  vi: string;
  en: string;
  category: string;
  imageFilename: string;
  imageSrc: string;
  skillId: string;
};

export type PackLesson = {
  id: string;
  order: number;
  titleEn: string;
  titleVi: string;
  categoryHint: string;
  newWordIds: string[];
  reviewWordIds: string[];
};

export type PackWordProgress = {
  seen: number;
  known: number;
  again: number;
  /** YYYY-MM-DD */
  due?: string;
  intervalDays?: number;
  lastGrade?: "know" | "again";
  spokeAt?: string;
  updatedAt: string;
};

export type PackProgressState = {
  version: 1;
  /** Completed pack lesson ids (e.g. u4-l01). */
  completedLessonIds: string[];
  words: Record<string, PackWordProgress>;
  updatedAt: string;
};
