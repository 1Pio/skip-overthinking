import { createDefaultDecisionDraft, type DecisionDraft } from "./draft.types";

const DRAFT_STORAGE_KEY = "skip-overthinking:decision-draft:v1";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isDecisionDraft = (value: unknown): value is DecisionDraft => {
  if (!isObject(value)) {
    return false;
  }

  const { decision, options } = value;

  if (!isObject(decision) || !Array.isArray(options)) {
    return false;
  }

  return (
    typeof decision.title === "string" &&
    typeof decision.description === "string" &&
    typeof decision.icon === "string"
  );
};

export const hydrateDraftFromStorage = (): DecisionDraft => {
  if (typeof window === "undefined") {
    return createDefaultDecisionDraft();
  }

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return createDefaultDecisionDraft();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isDecisionDraft(parsed)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  return createDefaultDecisionDraft();
};

export const persistDraftToStorage = (draft: DecisionDraft): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
};

export const clearDraftStorage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
};
