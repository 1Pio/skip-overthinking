import {
  CRITERION_BLANK_RATE_SOFT_WARNING_THRESHOLD,
  DESIRABILITY_MAX,
  DESIRABILITY_MIN,
  MEASURED_EQUAL_RAW_NEUTRAL_DESIRABILITY,
  NEUTRAL_DESIRABILITY,
  OPTION_COVERAGE_STRONG_WARNING_THRESHOLD,
  OPTION_COVERAGE_WARNING_THRESHOLD,
  RATING_CELL_KEY_SEPARATOR,
  type CriterionWeightSchema,
  type CriterionWeightsSchema,
  type NumericMeasuredCellSchema,
  type Rating120CellSchema,
  type RatingInputModeSchema,
  type RatingsMatrixSchema,
  type SevenLevelValueSchema,
} from "../ratings.schema";

export type RatingCellKey = string;

export type RatingInputMode = RatingInputModeSchema;
export type SevenLevelValue = SevenLevelValueSchema;
export type Rating120Cell = Rating120CellSchema;
export type NumericMeasuredCell = NumericMeasuredCellSchema;
export type RatingMatrixCell = Rating120Cell | NumericMeasuredCell;
export type RatingsMatrix = RatingsMatrixSchema;
export type CriterionWeight = CriterionWeightSchema;
export type CriterionWeights = CriterionWeightsSchema;

export type FillMissingReviewItem = {
  optionId: string;
  criterionId: string;
  criterionType: "rating_1_20" | "numeric_measured";
};

export const DEFAULT_RATING_INPUT_MODE: RatingInputMode = "numeric";

export const RATING_SEVEN_LEVEL_TO_NUMERIC: Record<SevenLevelValue, number> = {
  terrible: 1.0,
  very_poor: 4.2,
  poor: 7.3,
  ok: 10.5,
  good: 13.7,
  very_good: 16.8,
  excellent: 20.0,
};

export const RATING_NUMERIC_TO_SEVEN_LEVEL_ORDER: SevenLevelValue[] = [
  "terrible",
  "very_poor",
  "poor",
  "ok",
  "good",
  "very_good",
  "excellent",
];

export const toRatingCellKey = (optionId: string, criterionId: string): RatingCellKey =>
  `${optionId}${RATING_CELL_KEY_SEPARATOR}${criterionId}`;

export const parseRatingCellKey = (
  key: RatingCellKey,
): { optionId: string; criterionId: string } | null => {
  const separatorIndex = key.indexOf(RATING_CELL_KEY_SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }

  const optionId = key.slice(0, separatorIndex);
  const criterionId = key.slice(separatorIndex + RATING_CELL_KEY_SEPARATOR.length);
  if (!optionId || !criterionId) {
    return null;
  }

  return { optionId, criterionId };
};

export const mapSevenLevelToNumeric = (value: SevenLevelValue): number =>
  RATING_SEVEN_LEVEL_TO_NUMERIC[value];

export const mapNumericToNearestSevenLevel = (value: number): SevenLevelValue => {
  let nearest: SevenLevelValue = RATING_NUMERIC_TO_SEVEN_LEVEL_ORDER[0];
  let nearestDelta = Number.POSITIVE_INFINITY;

  for (const candidate of RATING_NUMERIC_TO_SEVEN_LEVEL_ORDER) {
    const delta = Math.abs(RATING_SEVEN_LEVEL_TO_NUMERIC[candidate] - value);
    if (delta < nearestDelta) {
      nearest = candidate;
      nearestDelta = delta;
    }
  }

  return nearest;
};

export const hasRating120Value = (cell: Rating120Cell | undefined): boolean =>
  !!cell && (cell.numericValue !== null || cell.sevenLevelValue !== null);

export const RATING_DOMAIN_CONSTANTS = {
  desirabilityMin: DESIRABILITY_MIN,
  desirabilityMax: DESIRABILITY_MAX,
  explicitNeutralFill: NEUTRAL_DESIRABILITY,
  measuredEqualRawNeutral: MEASURED_EQUAL_RAW_NEUTRAL_DESIRABILITY,
  optionCoverageWarningThreshold: OPTION_COVERAGE_WARNING_THRESHOLD,
  optionCoverageStrongWarningThreshold: OPTION_COVERAGE_STRONG_WARNING_THRESHOLD,
  criterionBlankRateSoftWarningThreshold: CRITERION_BLANK_RATE_SOFT_WARNING_THRESHOLD,
} as const;
