import { expect, test } from "@playwright/test";
import { clearAmiStorage, mockPaidServices } from "./fixtures/seed";
import { dismissGetStarted } from "./helpers/dismissGuide";
import { completePathLesson } from "./helpers/pathLesson";

test.describe("Journey A — New Student", () => {
  test.beforeEach(async ({ page }) => {
    await mockPaidServices(page);
    await clearAmiStorage(page);
  });

  test("welcome → Vietnamese → first Đánh Vần lesson → XP → refresh preserves progress", async ({
    page,
  }) => {
    await page.goto("/");
    await dismissGetStarted(page);
    await expect(page.getByRole("button", { name: /Learn Vietnamese/i })).toBeVisible();
    await page.getByRole("button", { name: /Learn Vietnamese/i }).click();

    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByText(/Southern Vietnamese first/i)).toBeVisible();

    // Dialect
    await page.getByRole("button", { name: /^Continue$/ }).click();
    // Goals — pick alphabet
    await page.getByText(/Alphabet & pronunciation first/i).click();
    await page.getByRole("button", { name: /^Continue$/ }).click();
    // Level (default "Brand new" already selected)
    await page.getByRole("button", { name: /^Continue$/ }).click();
    // Minutes — default 10
    await page.getByRole("button", { name: /^Continue$/ }).click();
    // Mic — skip
    await page.getByRole("button", { name: /Skip for now · Start learning/i }).click();

    // Alphabet goal routes to studio; go to Đánh Vần Foundations
    await page.goto("/danh-van");
    await expect(page.getByRole("heading", { name: /Đánh Vần/i })).toBeVisible();
    const xpBefore = await page.locator(".font-display.text-2xl.text-coral").first().innerText();
    expect(Number(xpBefore)).toBe(0);

    await page.goto("/danh-van/path/w0-l01");
    await expect(page.getByRole("heading", { name: /Sound a/i })).toBeVisible();

    await completePathLesson(page);
    await expect(page.getByRole("heading", { name: /Lesson complete/i })).toBeVisible();
    await expect(page.getByText(/\+10 XP/i).first()).toBeVisible();

    await page.goto("/danh-van");
    await page.reload();
    await expect(page.getByRole("heading", { name: /Đánh Vần/i })).toBeVisible();
    const xpAfter = await page.locator(".font-display.text-2xl.text-coral").first().innerText();
    expect(Number(xpAfter)).toBeGreaterThanOrEqual(10);
    await expect(page.getByText(/Done|Mastered/i).first()).toBeVisible();
  });
});

