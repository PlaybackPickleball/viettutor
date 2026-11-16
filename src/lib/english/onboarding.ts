export const GOALS = [
  { id: "daily", label: "Giao tiếp hằng ngày", lessons: ["d01", "d22"] },
  { id: "business", label: "Bán hàng / Kinh doanh", lessons: ["d09", "d24"] },
  { id: "travel", label: "Du lịch", lessons: ["d12", "d25"] },
  { id: "family", label: "Nói chuyện với gia đình", lessons: ["d15", "d18"] },
  { id: "self", label: "Học cho bản thân", lessons: ["d01", "d30"] },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export const LEVEL_OPTIONS = [
  { id: "none", label: "Chưa bao giờ", track: "beginner" },
  { id: "few_words", label: "Biết một vài từ", track: "beginner" },
  { id: "basic_cant_speak", label: "Biết cơ bản nhưng chưa nói được", track: "beginner" },
] as const;

export type LevelId = (typeof LEVEL_OPTIONS)[number]["id"];

export const MINUTE_OPTIONS = [5, 10, 15, 20] as const;
export type DailyMinutes = (typeof MINUTE_OPTIONS)[number];
export const RECOMMENDED_MINUTES: DailyMinutes = 10;
export const DEFAULT_LEVEL: LevelId = "none";

export const TRACK_NOTE =
  "Hiện chỉ có lộ trình sơ cấp. Mình không tách bài nâng cao giả.";

export type OnboardingDraft = {
  goals: GoalId[];
  level: LevelId;
  dailyMinutes: DailyMinutes;
};

export function defaultOnboarding(): OnboardingDraft {
  return { goals: [], level: DEFAULT_LEVEL, dailyMinutes: RECOMMENDED_MINUTES };
}

export function toggleGoal(goals: GoalId[], id: GoalId): GoalId[] {
  return goals.includes(id) ? goals.filter((item) => item !== id) : [...goals, id];
}

export function canLeaveGoals(goals: GoalId[]): boolean {
  return goals.length > 0;
}

export function suggestedLessonIds(goals: GoalId[]): string[] {
  const ids: string[] = [];
  for (const goal of GOALS) {
    if (!goals.includes(goal.id)) continue;
    for (const lessonId of goal.lessons) {
      if (!ids.includes(lessonId)) ids.push(lessonId);
    }
  }
  return ids;
}

export function dailyReviewLimit(minutes: DailyMinutes | null): number {
  if (minutes === 5) return 3;
  if (minutes === 15) return 6;
  if (minutes === 20) return 8;
  return 5;
}
