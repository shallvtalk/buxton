/** Frontend locales. The upstream API continues to store only en/ko/system. */
export const UI_LANGUAGES = ["en", "ko", "zh-CN"] as const;
export type Language = (typeof UI_LANGUAGES)[number];
export function resolveBrowserLanguage(tags: readonly string[]): Language {
  for (const tag of tags) {
    const base = tag.toLowerCase().split("-")[0];
    if (base === "zh") return "zh-CN";
    if (base === "en" || base === "ko") return base;
  }
  return "en";
}
