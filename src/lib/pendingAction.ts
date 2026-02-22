export type PendingActionType = "message" | "hire" | "favorite";

export interface PendingAction {
  type: PendingActionType;
  projectId: string;
  returnTo: string;
  timestamp: number;
}

export const PENDING_ACTION_KEY = "pendingAction";

export function savePendingAction(action: PendingAction) {
  localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
}

export function getPendingAction(): PendingAction | null {
  const raw = localStorage.getItem(PENDING_ACTION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingAction;
  } catch {
    localStorage.removeItem(PENDING_ACTION_KEY);
    return null;
  }
}

export function clearPendingAction() {
  localStorage.removeItem(PENDING_ACTION_KEY);
}
