import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("queryStore app close unsaved drafts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    setActivePinia(createPinia());
  });

  async function createStoreWithDirtyQueryTab() {
    const { useQueryStore } = await import("@/stores/queryStore");
    const queryStore = useQueryStore();
    const tabId = queryStore.createTab("conn-1", "db");
    queryStore.updateSql(tabId, "select 1;");
    return { queryStore, tabId };
  }

  it("prompts for unsaved SQL when quitting by default", async () => {
    const { queryStore } = await createStoreWithDirtyQueryTab();

    const confirmed = queryStore.requestAppCloseConfirmation();

    expect(confirmed).toBe(true);
    expect(queryStore.showCloseConfirm).toBe(true);
    expect(queryStore.closeConfirmContext).toBe("app");
  });

  it("skips the quit prompt and keeps unsaved drafts in keep-drafts mode", async () => {
    const { useSettingsStore } = await import("@/stores/settingsStore");
    useSettingsStore().updateEditorSettings({ appCloseUnsavedTabsMode: "keep-drafts" });

    const { queryStore } = await createStoreWithDirtyQueryTab();

    const confirmed = queryStore.requestAppCloseConfirmation();

    expect(confirmed).toBe(false);
    expect(queryStore.showCloseConfirm).toBe(false);
    expect(queryStore.tabs[0].sql).toBe("select 1;");
    expect(queryStore.isTabDirty(queryStore.tabs[0])).toBe(true);
  });

  it("still confirms individual dirty tab closes in keep-drafts mode", async () => {
    const { useSettingsStore } = await import("@/stores/settingsStore");
    useSettingsStore().updateEditorSettings({ appCloseUnsavedTabsMode: "keep-drafts" });

    const { queryStore, tabId } = await createStoreWithDirtyQueryTab();

    queryStore.closeTab(tabId);

    expect(queryStore.showCloseConfirm).toBe(true);
    expect(queryStore.closeConfirmContext).toBe("tab");
    expect(queryStore.tabs[0].sql).toBe("select 1;");
  });
});
