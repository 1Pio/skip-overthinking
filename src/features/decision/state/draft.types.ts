import type { DraftOption } from "../../options/state/option.types";

export type DecisionDetails = {
  title: string;
  description: string;
  icon: string;
};

export type DecisionDraft = {
  decision: DecisionDetails;
  options: DraftOption[];
};

export const createDefaultDecisionDraft = (): DecisionDraft => ({
  decision: {
    title: "",
    description: "",
    icon: "",
  },
  options: [],
});
