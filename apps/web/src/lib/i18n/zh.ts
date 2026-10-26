import { en } from "./en";
import { zhUi } from "./zh-ui";
import type { Translation } from "./core";

/** Reuses the same vetted copy for keyed pages and the remaining upstream UI. */
export const zh: Translation = Object.fromEntries(
  Object.entries(en).map(([key, value]) => [
    key,
    typeof value === "string"
      ? (zhUi[value] ?? value)
      : Object.fromEntries(Object.entries(value).map(([form, text]) => [form, zhUi[text] ?? text])),
  ]),
);
