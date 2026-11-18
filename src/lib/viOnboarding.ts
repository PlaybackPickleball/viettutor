/** EN→VI guided onboarding (Southern first). Separate from letter progress. */

export const VI_GOALS = [
  { id: "alphabet", label: "Alphabet & pronunciation first" },
  { id: "travel", label: "Travel & daily phrases" },
  { id: "family", label: "Talk with family" },
  { id: "work", label: "Work & school" },
  { id: "songs", label: "Learn through songs" },
] as const;

export type ViGoalId = (typeof VI_GOALS)[number]["id"];

export const VI_LEVEL_OPTIONS = [
  { id: "none", label: "Brand new to Vietnamese" },
  { id: "few_sounds", label: "I know a few letters or tones" },
  { id: "basic", label: "I can read a little but want a clean start" },
] as const;

export type ViLevelId = (typeof VI_LEVEL_OPTIONS)[number]["id"];

export type ViOnboardingRecord = {
  version: 1;
  completed: boolean;
  dialect: "southern";
  dailyMinutes: 5 | 10 | 15 | 20;
  mic: "granted" | "listening_only" | null;
  goals: ViGoalId[];
  level: ViLevelId;
  updatedAt: string;
};

const KEY = "ami-lingua.vi-onboarding.v1";

export function defaultViOnboarding(): ViOnboardingRecord {
  return {
    version: 1,
    completed: false,
    dialect: "southern",
    dailyMinutes: 10,
    mic: null,
    goals: [],
    level: "none",
    updatedAt: new Date().toISOString(),
  };
}

export function loadViOnboarding(): ViOnboardingRecord {
  if (typeof window === "undefined") return defaultViOnboarding();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultViOnboarding();
    const parsed = JSON.parse(raw) as Partial<ViOnboardingRecord>;
    const goals = Array.isArray(parsed.goals)
      ? parsed.goals.filter((g): g is ViGoalId =>
          VI_GOALS.some((option) => option.id === g),
        )
      : [];
    const level = VI_LEVEL_OPTIONS.some((o) => o.id === parsed.level)
      ? (parsed.level as ViLevelId)
      : "none";
    return {
      ...defaultViOnboarding(),
      ...parsed,
      version: 1,
      dialect: "southern",
      completed: Boolean(parsed.completed),
      goals,
      level,
    };
  } catch {
    return defaultViOnboarding();
  }
}

export function saveViOnboarding(record: ViOnboardingRecord) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    KEY,
    JSON.stringify({ ...record, version: 1, updatedAt: new Date().toISOString() }),
  );
}

export function isViOnboardingComplete(): boolean {
  return loadViOnboarding().completed;
}

export function toggleViGoal(goals: ViGoalId[], id: ViGoalId): ViGoalId[] {
  return goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id];
}

export function canLeaveViGoals(goals: ViGoalId[]): boolean {
  return goals.length > 0;
}

export function completeViOnboarding(
  partial: Pick<ViOnboardingRecord, "dailyMinutes" | "mic" | "goals" | "level">,
) {
  saveViOnboarding({
    ...loadViOnboarding(),
    ...partial,
    dialect: "southern",
    completed: true,
  });
}

/** Skip setup when a returning learner already has alphabet or Đánh Vần stamps. */
export function markViOnboardingSkippedForReturner() {
  saveViOnboarding({
    ...loadViOnboarding(),
    completed: true,
    dialect: "southern",
  });
}
