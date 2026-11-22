import type { Page } from "@playwright/test";

/** Drive one Foundations exercise to Next (deterministic UI actions). */
export async function completeCurrentExercise(page: Page) {
  const nextBtn = page.getByRole("button", { name: /^Next$/ });

  // listen-type (Recall) — must run before generic Hear Listen (same ListenControls).
  if (await page.getByText(/Type what you heard/i).isVisible().catch(() => false)) {
    const listenRecall = page.locator("button.teacher-btn-primary").filter({ hasText: /^Listen$/ });
    if (await listenRecall.isVisible().catch(() => false)) {
      await listenRecall.click();
    }
    await page.getByRole("button", { name: /^Reveal$/ }).click({ timeout: 12_000 });
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await nextBtn.click();
    return;
  }

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

  // MCQ — wrong picks do not unlock Next; try each card until solved.
  // (Do not prefer /^a/ — on w0-l02 “a” is a distractor and Next never appears.)
  const choices = page.locator("button.ami-card");
  if (await choices.first().isVisible().catch(() => false)) {
    const n = await choices.count();
    for (let i = 0; i < n; i++) {
      const card = choices.nth(i);
      if (await card.isDisabled().catch(() => false)) continue;
      await card.click();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        return;
      }
    }
    const hint = page.getByRole("button", { name: /Need a hint/i });
    if (await hint.isVisible().catch(() => false)) await hint.click();
    for (let i = 0; i < n; i++) {
      const card = choices.nth(i);
      if (await card.isDisabled().catch(() => false)) continue;
      await card.click();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        return;
      }
    }
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
