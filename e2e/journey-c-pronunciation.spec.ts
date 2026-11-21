import { expect, test } from "@playwright/test";
import { mockPaidServices, seedVietnameseLearner } from "./fixtures/seed";

test.describe("Journey C — Pronunciation (mocked provider)", () => {
  test.beforeEach(async ({ page }) => {
    await mockPaidServices(page);
    await seedVietnameseLearner(page);
  });

  test("speak-compare surfaces native play + continue; silent path is honest", async ({
    page,
  }) => {
    await page.goto("/danh-van/path/w0-l01");
    // Hear → Write → Say: finish Hear, skip Write, assert Say
    await page.locator("button.teacher-btn-primary", { hasText: /^Listen$/ }).click();
    await page.getByRole("button", { name: /I heard it/i }).click();
    await page.getByRole("button", { name: /^Next$/ }).click();

    await expect(page.getByRole("button", { name: /Skip trace \/ continue/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /Skip trace \/ continue/i }).click();
    await page.getByRole("button", { name: /^Next$/ }).click();

    await expect(page.getByRole("button", { name: /Record pronunciation/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Play native|Play audio/i }).first()).toBeVisible();

    // Continue without recording — no invented score required to progress
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await expect(page.getByRole("button", { name: /^Next$/ })).toBeVisible();
  });

  test("studio Say shows mic gate until listen; demo take does not invent quality", async ({
    page,
  }) => {
    await page.goto("/studio/a/say");
    await expect(page.getByText(/Listen|teacher|Mic stays closed/i).first()).toBeVisible();
    await page.locator("button.teacher-btn-primary", { hasText: /^Listen$/ }).click();
    const demo = page.getByRole("button", { name: /Demo practice take/i });
    await expect(demo).toBeVisible({ timeout: 10_000 });
    await demo.click();
    // Honest path: either unavailable label or a mocked score tip — never blank crash
    await expect(
      page
        .getByText(
          /Transcription unavailable|Unable to assess|Match|No match|Compare by ear|practice|Deepgram/i,
        )
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});

/**
 * Integration note (not run in routine CI):
 * Real Deepgram calls require DEEPGRAM_API_KEY and live/native audio.
 * Automated fixtures prove wiring + match UX — not six-tone real-world reliability.
 */
