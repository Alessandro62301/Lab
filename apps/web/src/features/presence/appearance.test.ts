import { describe, expect, it } from "vitest";

import {
  FONT_OPTIONS,
  ICON_OPTIONS,
  resolveFontFamily,
  resolveIconOption,
} from "./appearance";

describe("presence appearance options", () => {
  it("offers unique persisted values", () => {
    expect(new Set(FONT_OPTIONS.map((option) => option.value)).size).toBe(FONT_OPTIONS.length);
    expect(new Set(ICON_OPTIONS.map((option) => option.value)).size).toBe(ICON_OPTIONS.length);
  });

  it("resolves a font to a safe CSS stack", () => {
    expect(resolveFontFamily("Geist Mono")).toContain("--font-geist-mono");
    expect(resolveFontFamily("fonte-inexistente")).toBe(resolveFontFamily("Geist Sans"));
  });

  it("resolves icons and falls back to link", () => {
    expect(resolveIconOption("instagram").value).toBe("instagram");
    expect(resolveIconOption("icone-inexistente").value).toBe("link");
  });
});
