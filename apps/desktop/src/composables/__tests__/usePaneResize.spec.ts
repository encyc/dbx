import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PANE_WIDTH_PERCENT, clampPaneWidthPercent, loadPaneWidthPercent } from "@/composables/usePaneResize";

describe("usePaneResize width helpers", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("clamps widths into the supported range", () => {
    expect(clampPaneWidthPercent(5)).toBe(20);
    expect(clampPaneWidthPercent(50)).toBe(50);
    expect(clampPaneWidthPercent(95)).toBe(80);
  });

  it("loads a persisted width and clamps it", () => {
    const data = new Map<string, string>([["dbx-split-pane-width", "55"]]);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => data.get(key) ?? null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    expect(loadPaneWidthPercent("dbx-split-pane-width")).toBe(55);
    data.set("dbx-split-pane-width", "99");
    expect(loadPaneWidthPercent("dbx-split-pane-width")).toBe(80);
  });

  it("falls back to the default width for missing or invalid values", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    expect(loadPaneWidthPercent("dbx-split-pane-width")).toBe(DEFAULT_PANE_WIDTH_PERCENT);
  });
});
