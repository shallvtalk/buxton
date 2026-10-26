import { describe, expect, it } from "vitest";
import { en } from "../src/lib/i18n/en";
import { zh } from "../src/lib/i18n/zh";
import { translate } from "../src/lib/i18n/core";
import { resolveBrowserLanguage } from "../src/lib/i18n/languages";
import { translateUiText } from "../src/lib/i18n/ui-text";

describe("Simplified Chinese", () => {
  it("translates every existing message and preserves placeholders", () => {
    for (const [key, source] of Object.entries(en)) {
      const target = zh[key as keyof typeof en];
      expect(target, key).toBeDefined();
      for (const [form, english] of typeof source === "string" ? [["text", source]] : Object.entries(source)) {
        const chinese = typeof target === "string" ? target : target?.[form as "one" | "other"];
        expect(chinese, key).toMatch(/[\u3400-\u9fff]/);
        expect([...(chinese ?? "").matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort(), key).toEqual(
          [...english!.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort(),
        );
      }
    }
  });
  it("formats Chinese counts and UI copy without changing English", () => {
    expect(translate("zh-CN", "zh-CN", "login.tryAgainIn", { seconds: 30 })).toBe("30 秒后重试");
    expect(translate("zh-CN", "zh-CN", "notifications.titleUnread", { count: 2 })).toBe("通知（2 条未读）");
    expect(translateUiText("Settings", "zh-CN")).toBe("设置");
    expect(translateUiText("Settings", "en")).toBe("Settings");
  });
  it("recognizes Chinese browser language tags", () => {
    expect(resolveBrowserLanguage(["zh-CN", "en"])).toBe("zh-CN");
    expect(resolveBrowserLanguage(["zh-Hans"])).toBe("zh-CN");
    expect(resolveBrowserLanguage(["fr", "ko-KR"])).toBe("ko");
  });
});
