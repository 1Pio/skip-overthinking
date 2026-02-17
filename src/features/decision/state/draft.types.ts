import type { DraftOption } from "../../options/state/option.types";
import type {
  CriterionMultiDeleteUndoPayload,
  CriterionSelectionState,
  DraftCriterion,
} from "../../criteria/state/criterion.types";
import {
  DEFAULT_RATING_INPUT_MODE,
  type CriterionWeights,
  type RatingInputMode,
  type RatingsMatrix,
} from "../../ratings/state/rating.types";

export type DecisionDetails = {
  title: string;
  description: string;
  icon: string;
};

export type DecisionDraft = {
  decision: DecisionDetails;
  options: DraftOption[];
  criteria: DraftCriterion[];
  ratingsMatrix: RatingsMatrix;
  ratingInputMode: RatingInputMode;
  criterionWeights: CriterionWeights;
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
  ratingsMatrix: {},
  ratingInputMode: DEFAULT_RATING_INPUT_MODE,
  criterionWeights: {},
  criteriaSelection: {
    isSelecting: false,
    selectedCriterionIds: [],
  },
  criteriaMultiDeleteUndo: null,
});
