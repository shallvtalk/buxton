import { expect, test } from "@playwright/test";

const PASSWORD = process.env.TALORYS_DEV_PASSWORD || "talorys-dev-password";

test("sidebar collapses, keeps navigation and search, and restores after refresh", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Owner password").fill(PASSWORD);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  const sidebar = page.locator("#desktop-sidebar");
  const collapse = page.getByRole("button", { name: "Collapse sidebar", exact: true });
  await expect(collapse).toHaveAttribute("aria-expanded", "true");
  await collapse.focus();
  await page.keyboard.press("Enter");
  const expand = page.getByRole("button", { name: "Expand sidebar", exact: true });
  await expect(expand).toBeFocused();
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(72);
  await page.screenshot({ path: test.info().outputPath("sidebar-collapsed.png") });
  await sidebar.getByRole("link", { name: "Notes", exact: true }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await page.reload();
  await expect(sidebar).toHaveAttribute("data-collapsed", "true");
  await expect(sidebar.getByRole("link", { name: "Settings", exact: true })).toBeVisible();
  await sidebar.getByRole("button", { name: "Search workspace", exact: true }).click();
  const search = page.getByRole("dialog", { name: "Find your way" });
  await expect(search).toBeVisible();
  await page.keyboard.press("Escape");
  await expand.click();
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(264);
  await expect(sidebar.getByRole("textbox", { name: "Search conversations" })).toBeVisible();
  await page.reload();
  await expect(sidebar).toHaveAttribute("data-collapsed", "false");
});
