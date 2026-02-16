import type { DecisionDraft } from "./draft.types";

export const hasDecisionTitle = (draft: DecisionDraft): boolean =>
  draft.decision.title.trim().length > 0;

export const isDecisionStepComplete = (draft: DecisionDraft): boolean =>
  hasDecisionTitle(draft);
