import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import {
  clampDesirabilityValue,
  CRITERION_BLANK_RATE_SOFT_WARNING_THRESHOLD,
  MEASURED_EQUAL_RAW_NEUTRAL_DESIRABILITY,
  OPTION_COVERAGE_STRONG_WARNING_THRESHOLD,
  OPTION_COVERAGE_WARNING_THRESHOLD,
  type RatingsMatrixSchema,
} from "../ratings.schema";

import {
  mapSevenLevelToNumeric,
  toRatingCellKey,
  type CriterionWeights,
  type FillMissingReviewItem,
  type RatingInputMode,
} from "./rating.types";

type MeasuredCriterionStats = {
  minRaw: number;
  maxRaw: number;
};

type OptionCoverageSeverity = "ok" | "warning" | "strong_warning";

export type OptionWeightedCoverage = {
  optionId: string;
  filledWeight: number;
  totalWeight: number;
  coverageRatio: number;
  coveragePercent: number;
  severity: OptionCoverageSeverity;
};

export type CriterionBlankRateDiagnostic = {
  criterionId: string;
  blanks: number;
  totalOptions: number;
  blankRate: number;
  isSoftWarning: boolean;
};

export type WeightAssignmentStatus = {
  totalCriteria: number;
  assignedCount: number;
  missingCriterionIds: string[];
  isComplete: boolean;
};

const getMatrixCell = (
  matrix: RatingsMatrixSchema,
  optionId: string,
  criterionId: string,
) => matrix[toRatingCellKey(optionId, criterionId)];

export const deriveMeasuredDesirability = (
  raw: number,
  minRaw: number,
  maxRaw: number,
  rawDirection: "higher_raw_better" | "lower_raw_better",
): number => {
  if (maxRaw === minRaw) {
    return MEASURED_EQUAL_RAW_NEUTRAL_DESIRABILITY;
  }

  if (rawDirection === "higher_raw_better") {
    return clampDesirabilityValue(1 + (19 * (raw - minRaw)) / (maxRaw - minRaw));
  }

  return clampDesirabilityValue(1 + (19 * (maxRaw - raw)) / (maxRaw - minRaw));
};

const buildMeasuredStatsByCriterion = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
): Record<string, MeasuredCriterionStats> => {
  const statsByCriterion: Record<string, MeasuredCriterionStats> = {};

  for (const criterion of criteria) {
    if (criterion.type !== "numeric_measured") {
      continue;
    }

    const rawValues: number[] = [];
    for (const option of options) {
      const cell = getMatrixCell(matrix, option.id, criterion.id);
      if (cell?.criterionType === "numeric_measured" && cell.rawValue !== null) {
        rawValues.push(cell.rawValue);
      }
    }

    if (rawValues.length === 0) {
      continue;
    }

    statsByCriterion[criterion.id] = {
      minRaw: Math.min(...rawValues),
      maxRaw: Math.max(...rawValues),
    };
  }

  return statsByCriterion;
};

export const selectCellDesirability = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  input: {
    optionId: string;
    criterionId: string;
    ratingInputMode: RatingInputMode;
  },
): number | null => {
  const criterion = criteria.find((entry) => entry.id === input.criterionId);
  if (!criterion) {
    return null;
  }

  const cell = getMatrixCell(matrix, input.optionId, input.criterionId);
  if (!cell) {
    return null;
  }

  if (criterion.type === "rating_1_20") {
    if (cell.criterionType !== "rating_1_20") {
      return null;
    }

    if (input.ratingInputMode === "numeric") {
      if (cell.numericValue !== null) {
        return cell.numericValue;
      }

      return cell.sevenLevelValue ? mapSevenLevelToNumeric(cell.sevenLevelValue) : null;
    }

    if (cell.sevenLevelValue !== null) {
      return mapSevenLevelToNumeric(cell.sevenLevelValue);
    }

    return cell.numericValue;
  }

  if (cell.criterionType !== "numeric_measured" || cell.rawValue === null) {
    return null;
  }

  const measuredStatsByCriterion = buildMeasuredStatsByCriterion(options, criteria, matrix);
  const stats = measuredStatsByCriterion[criterion.id];
  if (!stats) {
    return null;
  }

  return deriveMeasuredDesirability(
    cell.rawValue,
    stats.minRaw,
    stats.maxRaw,
    criterion.rawDirection,
  );
};

export const selectMissingRatings = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  ratingInputMode: RatingInputMode,
): FillMissingReviewItem[] => {
  const missing: FillMissingReviewItem[] = [];

  for (const option of options) {
    for (const criterion of criteria) {
      const desirability = selectCellDesirability(options, criteria, matrix, {
        optionId: option.id,
        criterionId: criterion.id,
        ratingInputMode,
      });

      if (desirability === null) {
        missing.push({
          optionId: option.id,
          criterionId: criterion.id,
          criterionType: criterion.type,
        });
      }
    }
  }

  return missing;
};

export const selectRatingsCompletion = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  ratingInputMode: RatingInputMode,
) => {
  const totalCells = options.length * criteria.length;
  const missing = selectMissingRatings(options, criteria, matrix, ratingInputMode);
  const missingCount = missing.length;
  const filledCount = Math.max(0, totalCells - missingCount);
  const completionPercent =
    totalCells === 0 ? 0 : Math.round((filledCount / totalCells) * 100);

  return {
    totalCells,
    filledCount,
    missingCount,
    completionPercent,
  };
};

export const selectWeightAssignmentStatus = (
  criteria: DraftCriterion[],
  criterionWeights: CriterionWeights,
): WeightAssignmentStatus => {
  const missingCriterionIds = criteria
    .filter((criterion) => {
      const weight = criterionWeights[criterion.id];
      return !Number.isInteger(weight) || (weight ?? 0) < 1;
    })
    .map((criterion) => criterion.id);

  const totalCriteria = criteria.length;
  const assignedCount = Math.max(0, totalCriteria - missingCriterionIds.length);

  return {
    totalCriteria,
    assignedCount,
    missingCriterionIds,
    isComplete: totalCriteria > 0 && missingCriterionIds.length === 0,
  };
};

export const selectOptionWeightedCoverage = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  criterionWeights: CriterionWeights,
  ratingInputMode: RatingInputMode,
): OptionWeightedCoverage[] => {
  const totalWeight = criteria.reduce((sum, criterion) => {
    const criterionWeight = criterionWeights[criterion.id];
    return typeof criterionWeight === "number" ? sum + criterionWeight : sum;
  }, 0);

  return options.map((option) => {
    const filledWeight = criteria.reduce((sum, criterion) => {
      const criterionWeight = criterionWeights[criterion.id];
      if (typeof criterionWeight !== "number") {
        return sum;
      }

      const desirability = selectCellDesirability(options, criteria, matrix, {
        optionId: option.id,
        criterionId: criterion.id,
        ratingInputMode,
      });

      return desirability === null ? sum : sum + criterionWeight;
    }, 0);

    const coverageRatio = totalWeight === 0 ? 0 : filledWeight / totalWeight;
    const severity: OptionCoverageSeverity =
      coverageRatio < OPTION_COVERAGE_STRONG_WARNING_THRESHOLD
        ? "strong_warning"
        : coverageRatio < OPTION_COVERAGE_WARNING_THRESHOLD
          ? "warning"
          : "ok";

    return {
      optionId: option.id,
      filledWeight,
      totalWeight,
      coverageRatio,
      coveragePercent: Math.round(coverageRatio * 100),
      severity,
    };
  });
};

export const selectCriterionBlankRateDiagnostics = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  ratingInputMode: RatingInputMode,
): CriterionBlankRateDiagnostic[] =>
  criteria.map((criterion) => {
    const blanks = options.reduce((blankCount, option) => {
      const desirability = selectCellDesirability(options, criteria, matrix, {
        optionId: option.id,
        criterionId: criterion.id,
        ratingInputMode,
      });

      return desirability === null ? blankCount + 1 : blankCount;
    }, 0);

    const totalOptions = options.length;
    const blankRate = totalOptions === 0 ? 0 : blanks / totalOptions;

    return {
      criterionId: criterion.id,
      blanks,
      totalOptions,
      blankRate,
      isSoftWarning: blankRate > CRITERION_BLANK_RATE_SOFT_WARNING_THRESHOLD,
    };
  });

const measuredEqualRawSmoke = deriveMeasuredDesirability(
  12,
  12,
  12,
  "higher_raw_better",
);

const zeroLeakSmoke = [
  deriveMeasuredDesirability(3, 3, 9, "higher_raw_better"),
  deriveMeasuredDesirability(3, 3, 9, "lower_raw_better"),
  deriveMeasuredDesirability(9, 3, 9, "higher_raw_better"),
  deriveMeasuredDesirability(9, 3, 9, "lower_raw_better"),
].every((value) => value !== 0);

export const ratingsSelectorSmokeChecks = {
  measuredEqualRawsResolveTo10_5: measuredEqualRawSmoke === 10.5,
  desirabilityNeverOutputsZero: zeroLeakSmoke,
} as const;
