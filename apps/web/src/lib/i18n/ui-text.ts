import { useI18n } from "./index";
import { zhUi } from "./zh-ui";

/** Only apply to UI-owned copy; never to stored user text or generated responses. */
export function translateUiText(text: string, language: string): string {
  if (language !== "zh-CN") return text;
  const exact = zhUi[text];
  if (exact) return exact;
  const trimmed = text.trim();
  return zhUi[trimmed] ? text.replace(trimmed, zhUi[trimmed]!) : text;
}
export function useUiText(): (text: string) => string {
  const { language } = useI18n();
  return (text) => translateUiText(text, language);
}
