import { onBeforeUnmount, ref } from "vue";

const MIN_WIDTH_PERCENT = 20;
const MAX_WIDTH_PERCENT = 80;
export const DEFAULT_PANE_WIDTH_PERCENT = 40;

export function clampPaneWidthPercent(value: number): number {
  return Math.min(MAX_WIDTH_PERCENT, Math.max(MIN_WIDTH_PERCENT, value));
}

export function loadPaneWidthPercent(storageKey: string): number {
  if (typeof localStorage === "undefined") return DEFAULT_PANE_WIDTH_PERCENT;
  const raw = Number(localStorage.getItem(storageKey));
  return Number.isFinite(raw) && raw > 0 ? clampPaneWidthPercent(raw) : DEFAULT_PANE_WIDTH_PERCENT;
}

/**
 * Drag-to-resize helper for the side-by-side reference pane. The caller binds
 * `beginResize` to pointerdown on the divider and passes the pane row element
 * so the drag maps cursor X to a width percentage of that container.
 */
export function usePaneResize(storageKey: string) {
  const widthPercent = ref(loadPaneWidthPercent(storageKey));
  const isResizing = ref(false);
  let containerEl: HTMLElement | null = null;
  let containerWidth = 0;
  let containerLeft = 0;

  const saveWidth = () => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(storageKey, String(widthPercent.value));
    } catch {
      /* storage unavailable (private mode) — keep the in-memory width */
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!containerEl) return;
    widthPercent.value = clampPaneWidthPercent(((event.clientX - containerLeft) / containerWidth) * 100);
  };

  const stopResize = () => {
    if (!isResizing.value) return;
    isResizing.value = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopResize);
    saveWidth();
  };

  const beginResize = (element: HTMLElement | null) => {
    if (!element) return;
    containerEl = element;
    const rect = element.getBoundingClientRect();
    containerWidth = rect.width || 1;
    containerLeft = rect.left;
    isResizing.value = true;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  onBeforeUnmount(stopResize);

  return { widthPercent, isResizing, beginResize };
}
