import type { DraftOption } from "../../options/state/option.types";
import type {
  CriterionMultiDeleteUndoPayload,
  CriterionSelectionState,
  DraftCriterion,
} from "../../criteria/state/criterion.types";

export type DecisionDetails = {
  title: string;
  description: string;
  icon: string;
};

export type DecisionDraft = {
  decision: DecisionDetails;
  options: DraftOption[];
  criteria: DraftCriterion[];
  criteriaSelection: CriterionSelectionState;
  criteriaMultiDeleteUndo: CriterionMultiDeleteUndoPayload | null;
};

export const createDefaultDecisionDraft = (): DecisionDraft => ({
  decision: {
    title: "",
    description: "",
    icon: "",
  },
  options: [],
  criteria: [],
  criteriaSelection: {
    isSelecting: false,
    selectedCriterionIds: [],
  },
  criteriaMultiDeleteUndo: null,
});
