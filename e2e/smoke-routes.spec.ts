import { expect, test } from "@playwright/test";
import { mockPaidServices, seedVietnameseLearner } from "./fixtures/seed";

const ROUTES: { path: string; expectText: RegExp }[] = [
  { path: "/", expectText: /ÁMi Lingua|Continue Learning|Learn/i },
  { path: "/learn", expectText: /Learn|Unit|Continue/i },
  { path: "/learn/u1-l01", expectText: /Xin chào|Sound a|Hear|Discover/i },
  { path: "/learn/u2-l01", expectText: /tone|Six|locked|Meet|ba/i },
  { path: "/practice", expectText: /Practice|Hear|Speak|Review/i },
  { path: "/profile", expectText: /Profile|Progress|Streak/i },
  { path: "/danh-van", expectText: /Đánh Vần/i },
  { path: "/hear-write", expectText: /Hear|Write|vần|combo/i },
  { path: "/progress", expectText: /progress|star|practice|Profile/i },
  { path: "/settings", expectText: /setting|course|English|Vietnamese/i },
  { path: "/sing", expectText: /Sing|karaoke|song/i },
  { path: "/studio/a/hear", expectText: /Hear|Listen|a/i },
  { path: "/review/alphabet-audio", expectText: /Alphabet audio review|Pending Nicola|ElevenLabs|Enabled/i },
  { path: "/review/vocab-audio", expectText: /Vocabulary audio review|Enabled for learners|First-pack|Pending Nicola/i },
  { path: "/vocab", expectText: /vocab|word|review/i },
];

test.describe("Smoke — interactive routes load", () => {
  test.beforeEach(async ({ page }) => {
    await mockPaidServices(page);
    await seedVietnameseLearner(page);
  });

  for (const route of ROUTES) {
    test(`GET ${route.path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      const res = await page.goto(route.path);
      expect(res?.ok() || res?.status() === 304).toBeTruthy();
      await expect(page.getByText(route.expectText).first()).toBeVisible({ timeout: 15_000 });
      expect(errors.filter((e) => !/ResizeObserver|hydration/i.test(e))).toEqual([]);
    });
  }
});
