import type { Page } from "@playwright/test";

/** Close the first-run Get Started dialog if it is open. */
export async function dismissGetStarted(page: Page) {
  const gotIt = page.getByRole("button", { name: /^Got it$/i });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
  }
}
