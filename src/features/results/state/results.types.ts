import type { MethodCheckStateSchema, ResultMethodSchema } from "../results.schema";

export type ResultMethod = ResultMethodSchema;
export type MethodCheckState = MethodCheckStateSchema;

export type CoverageSeverity = "ok" | "warning" | "strong_warning";

export type ContributionRow = {
  criterionId: string;
  criterionTitle: string;
  criterionType: "rating_1_20" | "numeric_measured";
  criterionWeight: number;
  normalizedWeight: number;
  desirability: number | null;
  rawValue: number | null;
  wsmContribution: number;
  wpmFactor: number;
  isMissing: boolean;
};

export type RankingRow = {
  optionId: string;
  optionTitle: string;
  optionOrder: number;
  rank: number | null;
  score: number | null;
  scoreLabel: string;
  method: ResultMethod;
  coveragePercent: number;
  coverageSeverity: CoverageSeverity;
  isComplete: boolean;
  missingCriterionIds: string[];
  contributions: ContributionRow[];
};

export type MethodDifference = {
  topChanged: boolean;
  wsmTopOptionId: string | null;
  wpmTopOptionId: string | null;
  wsmTopOptionTitle: string | null;
  wpmTopOptionTitle: string | null;
};

export type MethodCheck = {
  state: MethodCheckState;
  summary: string;
  canExpand: boolean;
  wsm: {
    method: "wsm";
    rows: RankingRow[];
    topOptionId: string | null;
  };
  wpm: {
    method: "wpm";
    rows: RankingRow[];
    topOptionId: string | null;
  };
  difference: MethodDifference;
};

export type ResultsProjection = {
  rankingRows: RankingRow[];
  methodCheck: MethodCheck;
  hasMeasuredCriteria: boolean;
};
