import { expect, test } from "@playwright/test";
import { clearAmiStorage, mockPaidServices, seedEnglishLearner } from "./fixtures/seed";
import { dismissGetStarted } from "./helpers/dismissGuide";

test.describe("Journey E — English Course", () => {
  test("new learner can open English onboarding from welcome", async ({ page }) => {
    await mockPaidServices(page);
    await clearAmiStorage(page);
    await page.goto("/");
    await dismissGetStarted(page);
    await page.getByRole("button", { name: /Học Tiếng Anh/i }).click();
    await expect(page).toHaveURL(/\/en(\/onboarding)?/);
  });

  test("returning English learner reaches home and lessons index", async ({ page }) => {
    await mockPaidServices(page);
    await seedEnglishLearner(page);
    await page.goto("/en");
    await expect(page.getByText(/Học Tiếng Anh|Chào|Tiếp tục học/i).first()).toBeVisible();
    await page.goto("/en/lessons");
    await expect(page.getByText(/lesson|bài|Lesson|Tất cả|Day/i).first()).toBeVisible();
  });

  test("speak surface loads without console crash", async ({ page }) => {
    await mockPaidServices(page);
    await seedEnglishLearner(page);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/en/speak");
    await expect(page.getByText(/Speak|Nói|practice|lesson|giáo viên/i).first()).toBeVisible({
      timeout: 15_000,
    });
    expect(errors.filter((e) => !/ResizeObserver|hydration/i.test(e))).toEqual([]);
  });
});
