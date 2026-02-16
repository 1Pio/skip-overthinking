export type DraftOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

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
