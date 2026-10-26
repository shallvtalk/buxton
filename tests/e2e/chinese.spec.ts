import { expect, test } from "@playwright/test";

const PASSWORD = process.env.TALORYS_DEV_PASSWORD || "talorys-dev-password";

test("Simplified Chinese switches immediately and survives refresh without a backend locale change @mobile", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Owner password").fill(PASSWORD);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.getByText("What would you like to do today?")).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).first().click();
  const unsupported: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "PATCH" && request.url().endsWith("/api/settings") && request.postData()?.includes('"zh-CN"'))
      unsupported.push(request.url());
  });
  await page.getByLabel("Language", { exact: true }).selectOption("zh-CN");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { name: "设置", exact: true })).toBeVisible();
  await expect(page.getByLabel("语言", { exact: true })).toHaveValue("zh-CN");
  await page.reload();
  await expect(page.getByLabel("语言", { exact: true })).toHaveValue("zh-CN");
  await expect(page.getByRole("tab", { name: "通用", exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("settings-zh.png") });
  await page.getByRole("link", { name: "对话", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: /把空间留给重要的事/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /找到今天的重点/ })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "消息", exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("chat-zh.png") });
  await page.getByRole("link", { name: "待办", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "待办", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: /今天/ })).toBeVisible();
  await page.getByRole("link", { name: "笔记", exact: true }).first().click();
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page.getByLabel("笔记标题", { exact: true }).fill("Settings");
  await page.getByLabel("笔记内容", { exact: true }).fill("Settings, Cancel, Delete — user content stays unchanged.");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("笔记标题", { exact: true })).toHaveValue("Settings");
  await expect(page.getByLabel("笔记内容", { exact: true })).toHaveValue("Settings, Cancel, Delete — user content stays unchanged.");
  await page.getByRole("link", { name: "设置", exact: true }).first().click();
  await page.getByLabel("语言", { exact: true }).selectOption("en");
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("en");
  expect(unsupported).toEqual([]);
});
