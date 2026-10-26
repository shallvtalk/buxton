import { expect, test } from "@playwright/test";

const PASSWORD = process.env.TALORYS_DEV_PASSWORD || "talorys-dev-password";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByPlaceholder("Owner password").fill(PASSWORD);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.getByText("What would you like to do today?")).toBeVisible();
}

test("workspace search opens with the keyboard, navigates, and restores focus", async ({ page }) => {
  await login(page);
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Find your way" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("Notes");
  await dialog.getByRole("button", { name: /Notes Workspace/ }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Search workspace" }).first().click();
  await dialog.getByRole("textbox").fill("unmatched-workspace-query");
  await expect(dialog.getByRole("status")).toHaveText("No matching pages or conversations.");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Search workspace" }).first()).toBeFocused();
});

test("welcome layout stays at the top and works in both themes @mobile", async ({ page }) => {
  await login(page);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 393, height: 851 },
    { width: 851, height: 393 },
  ]) {
    await page.setViewportSize(viewport);
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      const heading = page.getByRole("heading", { name: /Make room for what matters/ });
      await expect(heading).toBeVisible();
      // The message scroller must not auto-scroll the welcome screen to its bottom.
      await expect.poll(() => page.locator(".chat-workspace .scrollbar-thin").evaluate((el) => el.scrollTop)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.getByRole("textbox", { name: "Message", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "New chat", exact: true })).toBeVisible();
      await page.screenshot({ path: test.info().outputPath(`welcome-${viewport.width}-${scheme}.png`) });
      if (viewport.width < 768) {
        await expect(page.locator(".mobile-nav")).toBeVisible();
        const composer = await page.locator(".composer-box").boundingBox();
        const nav = await page.locator(".mobile-nav").boundingBox();
        expect(composer!.y + composer!.height).toBeLessThanOrEqual(nav!.y);
      }
    }
  }
});
