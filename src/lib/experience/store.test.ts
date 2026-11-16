import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadProgress, practiceStreak, saveProgress, type ProgressState } from "@/lib/progress";
import {
  COURSE_KEY,
  loadCourse,
  memoryStore,
  setActiveCourse,
  setTextSize,
  uiLanguage,
} from "./store";
import {
  ENGLISH_PROGRESS_KEY,
  attachGuestProgress,
  clearStage,
  emptyEnglishProgress,
  saveEnglishProgress,
} from "@/lib/english/progress";
import { getEnglishLesson } from "@/lib/english/curriculum";

function installBrowserStorage(seed: Record<string, string> = {}) {
  const mem = new Map(Object.entries(seed));
  const api = {
    getItem: (key: string) => (mem.has(key) ? mem.get(key)! : null),
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: (index: number) => [...mem.keys()][index] ?? null,
    get length() {
      return mem.size;
    },
  };
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("localStorage", api);
  return mem;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("course selection", () => {
  it("starts unset when the device has no Vietnamese progress", () => {
    const store = memoryStore();
    expect(loadCourse(store).record).toBeNull();
    expect(store.snapshot()[COURSE_KEY]).toBeUndefined();
  });

  it("maps an existing Vietnamese learner to en_to_vi without rewriting progress", () => {
    const mem = installBrowserStorage();
    const seeded = loadProgress();
    seeded.practiceDates = [new Date().toISOString().slice(0, 10)];
    seeded.letters.a = { ...seeded.letters.a, heard: true, attempts: 4 };
    saveProgress(seeded);
    const before = mem.get("ami-lingua.progress.v2");
    expect(practiceStreak(loadProgress())).toBe(1);

    const loaded = loadCourse({
      getItem: (key) => mem.get(key) ?? null,
      setItem: (key, value) => {
        mem.set(key, value);
      },
    });

    expect(loaded.migrated).toBe(true);
    expect(loaded.record?.active).toBe("en_to_vi");
    expect(mem.get("ami-lingua.progress.v2")).toBe(before);
    expect(practiceStreak(loadProgress())).toBe(1);
    expect(loadProgress().letters.a.attempts).toBe(4);
  });

  it("keeps both courses when the learner switches", () => {
    const mem = installBrowserStorage();
    const store = {
      getItem: (key: string) => mem.get(key) ?? null,
      setItem: (key: string, value: string) => {
        mem.set(key, value);
      },
    };
    const vietnamese = loadProgress();
    vietnamese.letters.a.heard = true;
    saveProgress(vietnamese);
    const viRaw = mem.get("ami-lingua.progress.v2");

    let english = emptyEnglishProgress();
    english = clearStage(english, "d01", "d01-listen", 0, 3);
    saveEnglishProgress(english, store);
    const enRaw = mem.get(ENGLISH_PROGRESS_KEY);

    setActiveCourse(store, "vi_to_en");
    setActiveCourse(store, "en_to_vi");
    setTextSize(store, "large");

    expect(mem.get("ami-lingua.progress.v2")).toBe(viRaw);
    expect(mem.get(ENGLISH_PROGRESS_KEY)).toBe(enRaw);
    expect(loadCourse(store).record).toMatchObject({ active: "en_to_vi", textSize: "large" });
    expect(uiLanguage("vi_to_en")).toBe("vi");
    expect(uiLanguage("en_to_vi")).toBe("en");
  });

  it("attaches a guest English record without clearing lessons", () => {
    let progress = emptyEnglishProgress();
    progress = clearStage(progress, "d01", "d01-listen", 0, 2);
    progress.onboardingCompleted = true;
    const attached = attachGuestProgress(progress, "user-1");
    expect(attached.attachedUserId).toBe("user-1");
    expect(attached.lessons.d01.cleared).toEqual(["d01-listen"]);
    expect(attached.onboardingCompleted).toBe(true);
    expect(attachGuestProgress(attached, "user-2").attachedUserId).toBe("user-1");
  });

  it("does not use a destructive migration", () => {
    const sql = readFileSync("src/lib/supabase/migrations/002_experiences.sql", "utf8");
    expect(sql).toMatch(/default 'en_to_vi'/);
    expect(sql).not.toMatch(/\bdelete\s+from\b|\btruncate\b|\bdrop\s+table\b|\bdrop\s+column\b/i);
    expect(sql).not.toMatch(/recording_path/);
  });
});

describe("progress isolation snapshot", () => {
  it("loads lesson d01 from the English curriculum only", () => {
    const lesson = getEnglishLesson("d01");
    expect(lesson?.titleEn).toMatch(/Hello/);
    const state = loadProgress();
    expect(state.dialect).toBe("southern");
    expect((state as ProgressState).currentLetterId).toBeTruthy();
  });
});
