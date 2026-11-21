import type { Page } from "@playwright/test";

/** Isolated device profile — localStorage only, never production DB. */
export const TEST_USER = {
  id: "qa-local-student",
  label: "QA local student",
} as const;

export function courseRecord(active: "en_to_vi" | "vi_to_en" = "en_to_vi") {
  return {
    version: 1 as const,
    active,
    textSize: "standard" as const,
    chosen: true as const,
    updatedAt: new Date().toISOString(),
  };
}

export function completedViOnboarding() {
  return {
    version: 1 as const,
    completed: true,
    dialect: "southern" as const,
    dailyMinutes: 10 as const,
    mic: "listening_only" as const,
    goals: ["alphabet"] as const,
    level: "none" as const,
    updatedAt: new Date().toISOString(),
  };
}

export function emptyPathProgress() {
  return {
    version: 1,
    dialect: "southern",
    xp: 0,
    streakDays: 0,
    lastPracticeDate: null,
    lessons: {},
    skills: {},
    badges: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Returning student: first Foundations lesson completed with XP. */
export function returningPathProgress() {
  return {
    ...emptyPathProgress(),
    xp: 10,
    streakDays: 1,
    lastPracticeDate: new Date().toISOString().slice(0, 10),
    lessons: {
      "w0-l01": {
        completed: true,
        stars: 3,
        bestCorrectRatio: 1,
        attempts: 1,
        xpEarned: 10,
        completedAt: new Date().toISOString(),
      },
    },
  };
}

function clearAmiKeys() {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("ami-lingua")) keys.push(key);
  }
  for (const key of keys) localStorage.removeItem(key);
}

/** One-shot clear — do not use addInitScript (would wipe seeds on every navigation). */
export async function clearAmiStorage(page: Page) {
  await page.goto("/welcome");
  await page.evaluate(clearAmiKeys);
}

export async function seedVietnameseLearner(
  page: Page,
  opts: { returning?: boolean } = {},
) {
  const course = courseRecord("en_to_vi");
  const onboarding = completedViOnboarding();
  const path = opts.returning ? returningPathProgress() : emptyPathProgress();
  await page.goto("/welcome");
  await page.evaluate(
    ({ courseJson, onboardingJson, pathJson }) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("ami-lingua")) keys.push(key);
      }
      for (const key of keys) localStorage.removeItem(key);
      localStorage.setItem("ami-lingua.course.v1", courseJson);
      localStorage.setItem("ami-lingua.vi-onboarding.v1", onboardingJson);
      localStorage.setItem("ami-lingua.phonics-path.v1", pathJson);
      localStorage.setItem("ami-lingua.get-started.v1", "1");
    },
    {
      courseJson: JSON.stringify(course),
      onboardingJson: JSON.stringify(onboarding),
      pathJson: JSON.stringify(path),
    },
  );
}

export async function seedEnglishLearner(page: Page) {
  const course = courseRecord("vi_to_en");
  await page.goto("/welcome");
  await page.evaluate(
    ({ courseJson }) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("ami-lingua")) keys.push(key);
      }
      for (const key of keys) localStorage.removeItem(key);
      localStorage.setItem("ami-lingua.course.v1", courseJson);
      localStorage.setItem(
        "ami-lingua.vi-to-en.v1",
        JSON.stringify({
          version: 1,
          onboardingCompleted: true,
          goals: [],
          level: "beginner",
          dailyMinutes: 10,
          mic: "listening_only",
          lessons: {},
          attempts: [],
          review: [],
          updatedAt: new Date().toISOString(),
        }),
      );
      localStorage.setItem("ami-lingua.get-started.v1", "1");
    },
    { courseJson: JSON.stringify(course) },
  );
}

/** Stub Web Speech so ListenControls never hangs waiting for onend in headless Chromium. */
export async function stubSpeechSynthesis(page: Page) {
  await page.addInitScript(() => {
    const synth = {
      speaking: false,
      pending: false,
      paused: false,
      onvoiceschanged: null as ((this: SpeechSynthesis, ev: Event) => void) | null,
      getVoices: () => [] as SpeechSynthesisVoice[],
      cancel: () => undefined,
      pause: () => undefined,
      resume: () => undefined,
      speak: (utter: SpeechSynthesisUtterance) => {
        queueMicrotask(() => {
          utter.onend?.(new Event("end") as SpeechSynthesisEvent);
        });
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    };
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      get: () => synth,
    });
  });
}

/** Mock paid/AI routes so routine e2e never spends production keys. */
export async function mockPaidServices(page: Page) {
  await stubSpeechSynthesis(page);
  await page.route("**/api/tts**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, message: "TTS mocked unavailable in QA" }),
    });
  });
  await page.route("**/api/vi/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        pronunciation: true,
        locale: "vi-VN",
        dialectDefault: "southern",
        toneScoringValidated: false,
      }),
    });
  });
  await page.route("**/api/vi/assess", async (route) => {
    const body = route.request().postDataJSON() as { expected?: string } | null;
    const expected = body?.expected?.trim() || "";
    if (!expected) {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          feedback: {
            status: "unavailable",
            scoringAvailable: false,
            suitableForAutoGrade: false,
            overallScore: null,
            accuracyScore: null,
            tip: "Missing Vietnamese reference text.",
            toneScore: null,
            toneStatus: "not_validated",
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        feedback: {
          status: "scored",
          scoringAvailable: true,
          suitableForAutoGrade: true,
          overallScore: 84,
          accuracyScore: 81,
          fluencyScore: 80,
          recognizedText: expected,
          tip: "Good pronunciation! Listen once more and keep that mouth shape.",
          toneScore: null,
          toneStatus: "not_validated",
        },
      }),
    });
  });
  await page.route("**/api/english/assess", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        feedback: {
          source: "provider",
          phonemeScoringAvailable: false,
          category: "fairly_good",
          categoryLabel: "Khá tốt",
          observationVi: "QA mock — không phải điểm từng âm.",
          recognizedText: "hello",
          providerScore: 78,
          failed: false,
          allowPraise: true,
        },
      }),
    });
  });
  await page.route("**/api/english/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ai: false, phoneme: false, studioEnglishVoice: false }),
    });
  });
  await page.route("**/api/analyze-**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, mocked: true }),
    });
  });
}
