import type { DecisionDraft } from "./draft.types";
import { decisionSetupSchema } from "../setup/decision.schema";

const decisionTitleSchema = decisionSetupSchema.pick({ title: true });

export const hasDecisionTitle = (draft: DecisionDraft): boolean =>
  decisionTitleSchema.safeParse({ title: draft.decision.title }).success;

export const isDecisionStepComplete = (draft: DecisionDraft): boolean =>
  decisionSetupSchema.safeParse(draft.decision).success;
