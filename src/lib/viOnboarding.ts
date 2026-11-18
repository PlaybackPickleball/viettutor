/** EN→VI guided onboarding (Southern first). Separate from letter progress. */

export type ViOnboardingRecord = {
  version: 1;
  completed: boolean;
  dialect: "southern";
  dailyMinutes: 5 | 10 | 15 | 20;
  mic: "granted" | "listening_only" | null;
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
    updatedAt: new Date().toISOString(),
  };
}

export function loadViOnboarding(): ViOnboardingRecord {
  if (typeof window === "undefined") return defaultViOnboarding();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultViOnboarding();
    const parsed = JSON.parse(raw) as Partial<ViOnboardingRecord>;
    return {
      ...defaultViOnboarding(),
      ...parsed,
      version: 1,
      dialect: "southern",
      completed: Boolean(parsed.completed),
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

export function completeViOnboarding(
  partial: Pick<ViOnboardingRecord, "dailyMinutes" | "mic">,
) {
  saveViOnboarding({
    ...loadViOnboarding(),
    ...partial,
    dialect: "southern",
    completed: true,
  });
}
