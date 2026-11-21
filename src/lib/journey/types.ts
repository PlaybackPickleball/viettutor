/** Guided Learning Journey — unit/lesson shells for Phase 1 path UI. */

export type JourneyLessonKind = "live" | "shell";

export type JourneyLesson = {
  id: string;
  unitId: string;
  order: number;
  titleEn: string;
  titleVi?: string;
  durationMin: number;
  kind: JourneyLessonKind;
  /** Deep link into existing surfaces (live only). */
  href?: string;
  /** Completion detected from Đánh Vần path progress. */
  pathLessonId?: string;
  /** Completion detected from alphabet studio progress. */
  letterId?: string;
  /**
   * How letterId counts as done. Default "letter" = full Hear·Say·Write·Link.
   * "heard" / "said" are softer gates for early Discover lessons.
   */
  letterGate?: "letter" | "heard" | "said";
  /** True when Hear & Write has any attempt recorded. */
  hearWriteTouched?: boolean;
  /** Playable via `/learn/[id]` reusable engine — completion via journey.completedIds. */
  engine?: boolean;
};

export type JourneyUnit = {
  id: string;
  order: number;
  titleEn: string;
  titleVi: string;
  blurb: string;
  /** Curriculum target count — shells do not invent empty rows for every slot. */
  targetLessonCount: number;
  lessons: JourneyLesson[];
};

export type JourneyLessonStatus = "locked" | "available" | "completed" | "coming_soon";

export type ContinueLearningTarget = {
  href: string;
  unitId: string;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  durationMin: number;
  progressLabel: string;
  progressPct: number;
};
