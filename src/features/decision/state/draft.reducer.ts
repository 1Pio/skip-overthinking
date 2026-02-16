import {
  createDefaultDecisionDraft,
  type DecisionDraft,
  type DecisionDetails,
} from "./draft.types";
import type { OptionAction } from "../../options/state/option.actions";

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
  | OptionAction;

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
  }
};
