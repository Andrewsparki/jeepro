import type { ComponentType } from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextDataRecord = Record<string, any>;

export interface ContextMenuTargetData<T = ContextDataRecord> {
  type: string;
  id?: string;
  title?: string;
  data?: T;
  actions?: ContextMenuItem[];
}

export interface ContextMenuRouter {
  push: (path: string) => void;
  replace?: (path: string) => void;
  back?: () => void;
  forward?: () => void;
  refresh?: () => void;
}

export interface ContextResolutionContext<T = ContextDataRecord> {
  target: ContextMenuTargetData<T>;
  pathname: string;
  section: string;
  event: MouseEvent | TouchEvent;
  targetElement: HTMLElement;
  router?: ContextMenuRouter;
  linkHref?: string | null;
}

export type ContextActionResolver<T = ContextDataRecord> = (
  context: ContextResolutionContext<T>
) => ContextMenuItem[] | Promise<ContextMenuItem[]> | null | undefined;

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  title?: string;
  items: ContextMenuItem[];
  targetType?: string;
}
