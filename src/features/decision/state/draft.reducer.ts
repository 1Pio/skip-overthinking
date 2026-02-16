import {
  createDefaultDecisionDraft,
  type DecisionDraft,
  type DecisionDetails,
} from "./draft.types";
import type { OptionAction } from "../../options/state/option.actions";
import type { CriterionAction } from "../../criteria/state/criterion.actions";

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
  | CriterionAction;

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
      return action.payload;
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
        criteriaMultiDeleteUndo: action.payload.undo,
      };
    }
  }
};
