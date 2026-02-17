import {
  createDefaultDecisionDraft,
  type DecisionDraft,
  type DecisionDetails,
} from "./draft.types";
import type { OptionAction } from "../../options/state/option.actions";
import type { CriterionAction } from "../../criteria/state/criterion.actions";
import type { RatingAction } from "../../ratings/state/rating.actions";
import { withDefaultCriterionWeights } from "../../ratings/state/rating.types";

export type DraftAction =
  | {
      type: "decisionUpdated";
      payload: Partial<DecisionDetails>;
    }
  | {
      type: "draftInitialized";
      payload: DecisionDraft;
    }
  | {
      type: "draftReset";
    }
  | OptionAction
  | CriterionAction
  | RatingAction;

export const draftReducer = (
  state: DecisionDraft,
  action: DraftAction,
): DecisionDraft => {
  switch (action.type) {
    case "decisionUpdated": {
      return {
        ...state,
        decision: {
          ...state.decision,
          ...action.payload,
        },
      };
    }
    case "draftInitialized": {
      return {
        ...action.payload,
        criterionWeights: withDefaultCriterionWeights(
          action.payload.criteria,
          action.payload.criterionWeights,
        ),
      };
    }
    case "draftReset": {
      return createDefaultDecisionDraft();
    }
    case "optionAdded":
    case "optionEdited":
    case "optionDeleted":
    case "optionReordered": {
      return {
        ...state,
        options: action.payload.options,
      };
    }
    case "criterionAdded":
    case "criterionEdited":
    case "criterionDeleted":
    case "criterionReordered": {
      return {
        ...state,
        criteria: action.payload.criteria,
        criterionWeights: withDefaultCriterionWeights(
          action.payload.criteria,
          state.criterionWeights,
        ),
      };
    }
    case "criterionSelectionModeEntered": {
      return {
        ...state,
        criteriaSelection: {
          isSelecting: true,
          selectedCriterionIds: action.payload.selectedCriterionIds,
        },
      };
    }
    case "criterionSelectionModeCleared": {
      return {
        ...state,
        criteriaSelection: {
          isSelecting: false,
          selectedCriterionIds: [],
        },
      };
    }
    case "criterionMultiDeleted": {
      return {
        ...state,
        criteria: action.payload.criteria,
        criterionWeights: withDefaultCriterionWeights(
          action.payload.criteria,
          state.criterionWeights,
        ),
        criteriaSelection: {
          isSelecting: false,
          selectedCriterionIds: [],
        },
        criteriaMultiDeleteUndo: action.payload.undo,
      };
    }
    case "criterionMultiDeleteUndone": {
      return {
        ...state,
        criteria: action.payload.criteria,
        criterionWeights: withDefaultCriterionWeights(
          action.payload.criteria,
          state.criterionWeights,
        ),
        criteriaMultiDeleteUndo: action.payload.undo,
      };
    }
    case "ratingCellUpdated":
    case "ratingMissingNeutralFillApplied": {
      return {
        ...state,
        ratingsMatrix: action.payload.ratingsMatrix,
      };
    }
    case "ratingInputModeUpdated": {
      return {
        ...state,
        ratingInputMode: action.payload.ratingInputMode,
      };
    }
    case "criterionWeightUpdated": {
      return {
        ...state,
        criterionWeights: action.payload.criterionWeights,
      };
    }
  }
};
