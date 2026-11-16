/**
 * Which learning experience is active.
 * Vietnamese letter progress stays in its own localStorage key.
 * Choosing or switching a course never rewrites that record.
 */

export const EXPERIENCE_IDS = ["en_to_vi", "vi_to_en"] as const;
export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

export type TextSize = "standard" | "large";

export type CourseRecord = {
  version: 1;
  active: ExperienceId;
  textSize: TextSize;
  /** True only after the learner taps a welcome card or switches in settings. */
  chosen: true;
  updatedAt: string;
};

export const COURSE_KEY = "ami-lingua.course.v1";
const TEXT_SIZE_KEY = "ami-lingua.text-size";
/** Existing ÁMi Lingua keys. Read to detect a returning learner. Never overwritten here. */
export const VIETNAMESE_PROGRESS_KEYS = ["ami-lingua.progress.v2", "ami-lingua.progress.v1"] as const;

export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function memoryStore(seed: Record<string, string> = {}): KeyValueStore & {
  snapshot(): Record<string, string>;
} {
  const mem = new Map(Object.entries(seed));
  return {
    getItem: (key) => (mem.has(key) ? mem.get(key)! : null),
    setItem: (key, value) => {
      mem.set(key, value);
    },
    snapshot: () => Object.fromEntries(mem.entries()),
  };
}

export function browserStore(): KeyValueStore {
  if (typeof window === "undefined") {
    throw new Error("browserStore is only available in the browser");
  }
  return window.localStorage;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function parseCourse(raw: string | null): CourseRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CourseRecord>;
    if (parsed.version !== 1) return null;
    if (parsed.active !== "en_to_vi" && parsed.active !== "vi_to_en") return null;
    if (parsed.chosen !== true) return null;
    const textSize: TextSize = parsed.textSize === "large" ? "large" : "standard";
    return {
      version: 1,
      active: parsed.active,
      textSize,
      chosen: true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : nowIso(),
    };
  } catch {
    return null;
  }
}

export function hasVietnameseProgress(store: KeyValueStore): boolean {
  return VIETNAMESE_PROGRESS_KEYS.some((key) => {
    const raw = store.getItem(key);
    return Boolean(raw && raw.length > 2);
  });
}

/**
 * Welcome stays up until the learner explicitly picks a language.
 * Vietnamese letter progress is left untouched either way.
 */
export function loadCourse(store: KeyValueStore): { record: CourseRecord | null; migrated: boolean } {
  const existing = parseCourse(store.getItem(COURSE_KEY));
  if (existing?.chosen) return { record: existing, migrated: false };
  return { record: null, migrated: false };
}

export function saveCourse(store: KeyValueStore, record: CourseRecord): CourseRecord {
  const next = { ...record, version: 1 as const, updatedAt: nowIso() };
  store.setItem(COURSE_KEY, JSON.stringify(next));
  return next;
}

export function readTextSize(store: KeyValueStore): TextSize {
  const current = parseCourse(store.getItem(COURSE_KEY));
  if (current) return current.textSize;
  return store.getItem(TEXT_SIZE_KEY) === "large" ? "large" : "standard";
}

export function setActiveCourse(store: KeyValueStore, active: ExperienceId): CourseRecord {
  const current = parseCourse(store.getItem(COURSE_KEY));
  return saveCourse(store, {
    version: 1,
    active,
    textSize: current?.textSize ?? readTextSize(store),
    chosen: true,
    updatedAt: nowIso(),
  });
}

/** Saves text size. Does not choose a course when the learner has not picked one yet. */
export function setTextSize(store: KeyValueStore, textSize: TextSize): TextSize {
  const current = parseCourse(store.getItem(COURSE_KEY));
  if (!current) {
    store.setItem(TEXT_SIZE_KEY, textSize);
    return textSize;
  }
  saveCourse(store, { ...current, textSize, chosen: true, updatedAt: nowIso() });
  return textSize;
}

export function uiLanguage(active: ExperienceId | null): "en" | "vi" {
  return active === "vi_to_en" ? "vi" : "en";
}
