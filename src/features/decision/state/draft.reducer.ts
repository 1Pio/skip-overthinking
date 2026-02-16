import {
  createDefaultDecisionDraft,
  type DecisionDraft,
  type DecisionDetails,
} from "./draft.types";

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
    };

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
  }
};
