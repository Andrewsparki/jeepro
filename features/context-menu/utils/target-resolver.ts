import { ContextMenuTargetData } from "../types/context-menu.types";
import { getSectionFromPathname } from "./route-helper";

// WeakMap storing React-level metadata associated with DOM nodes
const targetElementMap = new WeakMap<HTMLElement, ContextMenuTargetData>();

export function registerTargetElement(element: HTMLElement, data: ContextMenuTargetData) {
  targetElementMap.set(element, data);
}

export function unregisterTargetElement(element: HTMLElement) {
  targetElementMap.delete(element);
}

/**
 * Checks whether an element is an input or editable field where native
 * browser context menu (Cut, Copy, Paste, Spellcheck, Inspect) must be preserved.
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  if (target.isContentEditable || target.closest("[contenteditable='true']")) {
    return true;
  }

  // Preserve native browser context menu if user highlighted text
  const selection = typeof window !== "undefined" ? window.getSelection() : null;
  if (selection && selection.toString().trim().length > 0) {
    return true;
  }

  // Preserve native dropdown/popover menus when clicked directly inside them
  if (target.closest('[role="menu"], [data-radix-popper-content-wrapper], [data-radix-menu-content]')) {
    return true;
  }

  return false;
}

/**
 * Helper to identify if an element or its ancestors is an anchor <a> or link target,
 * returning the valid href or data-context-href string if present.
 */
export function findLinkHref(startElement: HTMLElement | null): string | null {
  if (!startElement) return null;
  let current: HTMLElement | null = startElement;
  while (current && current !== document.body && current !== document.documentElement) {
    if (current.tagName.toUpperCase() === "A") {
      const href = (current as HTMLAnchorElement).getAttribute("href");
      if (href && href !== "#" && !href.startsWith("javascript:")) {
        return href;
      }
    }
    const dataHref = current.getAttribute("data-context-href");
    if (dataHref && dataHref !== "#" && !dataHref.startsWith("javascript:")) {
      return dataHref;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Identifies the semantic target from a clicked DOM element.
 * Walks up the DOM tree looking for registered context target data
 * or dataset attributes, falling back to 'page-background'.
 */
export function findContextTarget(
  startElement: HTMLElement | null,
  pathname: string
): { target: ContextMenuTargetData; element: HTMLElement } | null {
  if (!startElement) return null;

  let current: HTMLElement | null = startElement;

  while (current && current !== document.body && current !== document.documentElement) {
    // Check WeakMap first (React-bound target)
    const registeredData = targetElementMap.get(current);
    if (registeredData) {
      return { target: registeredData, element: current };
    }

    // Check data-context-target attribute
    const type = current.getAttribute("data-context-target");
    if (type) {
      const id = current.getAttribute("data-context-id") || undefined;
      const title = current.getAttribute("data-context-title") || undefined;
      let data: Record<string, unknown> | undefined = undefined;
      const rawData = current.getAttribute("data-context-data");
      if (rawData) {
        try {
          data = JSON.parse(rawData);
        } catch {
          data = { raw: rawData };
        }
      }

      return {
        target: { type, id, title, data },
        element: current,
      };
    }

    current = current.parentElement;
  }

  // Fallback to page-background for authenticated area
  const section = getSectionFromPathname(pathname);
  return {
    target: {
      type: "page-background",
      title: undefined,
      data: { section },
    },
    element: startElement,
  };
}
