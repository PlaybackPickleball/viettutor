import type { Page } from "@playwright/test";

/** Drive one Foundations exercise to Next (deterministic UI actions). */
export async function completeCurrentExercise(page: Page) {
  const nextBtn = page.getByRole("button", { name: /^Next$/ });

  // Already listened on hear-sound
  const heard = page.getByRole("button", { name: /I heard it/i });
  if (await heard.isVisible().catch(() => false)) {
    await heard.click();
    await nextBtn.click();
    return;
  }

  // hear-sound — start listen
  const listen = page.locator("button.teacher-btn-primary").filter({ hasText: /^Listen$/ });
  if (await listen.isVisible().catch(() => false)) {
    await listen.click();
    await page.getByRole("button", { name: /I heard it/i }).click({ timeout: 12_000 });
    await nextBtn.click();
    return;
  }

  // build-syllable — play sequence (TTS may fail; builder still stamps)
  const playSequence = page.getByRole("button", { name: /Play sequence/i });
  if (await playSequence.isVisible().catch(() => false)) {
    await playSequence.click();
    const buildContinue = page.getByRole("button", { name: /^Continue$/ });
    await buildContinue.waitFor({ timeout: 15_000 });
    await buildContinue.click();
    await nextBtn.click();
    return;
  }

  // speak-compare — continue without a new take
  if (await page.getByText(/Record pronunciation/i).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await nextBtn.click();
    return;
  }

  // write-trace skip
  const skipTrace = page.getByRole("button", { name: /Skip trace/i });
  if (await skipTrace.isVisible().catch(() => false)) {
    await skipTrace.click();
    await nextBtn.click();
    return;
  }

  // read-without-help
  const reveal = page.getByRole("button", { name: /Reveal meaning/i });
  if (await reveal.isVisible().catch(() => false)) {
    await reveal.click();
  }
  if (
    (await page.getByRole("button", { name: /^Continue$/ }).isVisible().catch(() => false)) &&
    !(await page.getByText(/Record pronunciation/i).isVisible().catch(() => false))
  ) {
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await nextBtn.click();
    return;
  }

  // MCQ — prefer known correct for w0-l01 review (a)
  const choiceA = page.locator("button.ami-card").filter({ hasText: /^a$/i }).first();
  if (await choiceA.isVisible().catch(() => false)) {
    await choiceA.click();
    await nextBtn.click();
    return;
  }

  const anyChoice = page.locator("button.ami-card").first();
  if (await anyChoice.isVisible().catch(() => false)) {
    await anyChoice.click();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      return;
    }
    const hint = page.getByRole("button", { name: /Need a hint/i });
    if (await hint.isVisible().catch(() => false)) await hint.click();
    const second = page.locator("button.ami-card").nth(1);
    if (await second.isVisible().catch(() => false)) await second.click();
    await nextBtn.click();
    return;
  }

  throw new Error("Could not complete current path exercise — unknown UI state");
}

export async function completePathLesson(page: Page, maxExercises = 12) {
  for (let i = 0; i < maxExercises; i++) {
    if (await page.getByRole("heading", { name: /Lesson complete/i }).isVisible().catch(() => false)) {
      return;
    }
    await completeCurrentExercise(page);
  }
  await page.getByRole("heading", { name: /Lesson complete/i }).waitFor({ timeout: 10_000 });
}
