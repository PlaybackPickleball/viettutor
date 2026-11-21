import { expect, test } from "@playwright/test";
import { mockPaidServices, seedVietnameseLearner } from "./fixtures/seed";
import { completePathLesson } from "./helpers/pathLesson";

test.describe("Journey B — Returning Student", () => {
  test.beforeEach(async ({ page }) => {
    await mockPaidServices(page);
    await seedVietnameseLearner(page, { returning: true });
  });

  test("sees completed first lesson, resumes next, mastery updates", async ({ page }) => {
    await page.goto("/danh-van");
    await expect(page.getByRole("heading", { name: /Đánh Vần/i })).toBeVisible();
    await expect(page.locator(".font-display.text-2xl.text-coral").first()).toHaveText("10");

    // First Foundations lesson marked done in the map
    await expect(page.getByText(/Sound a/i).first()).toBeVisible();
    await expect(page.getByText(/Done|Mastered/i).first()).toBeVisible();

    await page.goto("/danh-van/path/w0-l02");
    await expect(page.getByRole("heading", { name: /b|ba/i })).toBeVisible();
    await completePathLesson(page);
    await expect(page.getByRole("heading", { name: /Lesson complete/i })).toBeVisible();

    await page.goto("/danh-van");
    const xp = Number(await page.locator(".font-display.text-2xl.text-coral").first().innerText());
    expect(xp).toBeGreaterThanOrEqual(20);
  });
});
