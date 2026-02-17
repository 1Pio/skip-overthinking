import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import {
  NEUTRAL_DESIRABILITY,
  toDesirabilityValueOrNull,
  type NumericMeasuredCellSchema,
  type Rating120CellSchema,
  type RatingsMatrixSchema,
} from "../ratings.schema";

import {
  DEFAULT_RATING_INPUT_MODE,
  mapNumericToNearestSevenLevel,
  mapSevenLevelToNumeric,
  toRatingCellKey,
  type CriterionWeights,
  type FillMissingReviewItem,
  type RatingInputMode,
  type SevenLevelValue,
} from "./rating.types";

type RatingCellUpdatePayload = {
  ratingsMatrix: RatingsMatrixSchema;
};

type RatingModeUpdatePayload = {
  ratingInputMode: RatingInputMode;
};

type CriterionWeightsUpdatePayload = {
  criterionWeights: CriterionWeights;
};

export type RatingAction =
  | {
      type: "ratingCellUpdated";
      payload: RatingCellUpdatePayload;
    }
  | {
      type: "ratingInputModeUpdated";
      payload: RatingModeUpdatePayload;
    }
  | {
      type: "ratingMissingNeutralFillApplied";
      payload: RatingCellUpdatePayload;
    }
  | {
      type: "criterionWeightUpdated";
      payload: CriterionWeightsUpdatePayload;
    };

const getRating120Cell = (
  matrix: RatingsMatrixSchema,
  optionId: string,
  criterionId: string,
): Rating120CellSchema => {
  const key = toRatingCellKey(optionId, criterionId);
  const existing = matrix[key];
  if (existing?.criterionType === "rating_1_20") {
    return existing;
  }

  return {
    criterionType: "rating_1_20",
    numericValue: null,
    sevenLevelValue: null,
    lastEditedMode: null,
  };
};

const getNumericMeasuredCell = (
  matrix: RatingsMatrixSchema,
  optionId: string,
  criterionId: string,
): NumericMeasuredCellSchema => {
  const key = toRatingCellKey(optionId, criterionId);
  const existing = matrix[key];
  if (existing?.criterionType === "numeric_measured") {
    return existing;
  }

  return {
    criterionType: "numeric_measured",
    rawValue: null,
  };
};

const upsertMatrixCell = (
  matrix: RatingsMatrixSchema,
  optionId: string,
  criterionId: string,
  cell: Rating120CellSchema | NumericMeasuredCellSchema,
): RatingsMatrixSchema => {
  const key = toRatingCellKey(optionId, criterionId);
  return {
    ...matrix,
    [key]: cell,
  };
};

export const ratingInputModeUpdated = (mode: RatingInputMode): RatingAction => ({
  type: "ratingInputModeUpdated",
  payload: {
    ratingInputMode: mode,
  },
});

export const rating120NumericCellUpdated = (
  matrix: RatingsMatrixSchema,
  input: {
    optionId: string;
    criterionId: string;
    numericValue: number | null;
  },
): RatingAction => {
  const existing = getRating120Cell(matrix, input.optionId, input.criterionId);
  const nextNumericValue = toDesirabilityValueOrNull(input.numericValue);

  const nextCell: Rating120CellSchema = {
    ...existing,
    numericValue: nextNumericValue,
    sevenLevelValue:
      nextNumericValue === null
        ? existing.sevenLevelValue
        : (existing.sevenLevelValue ?? mapNumericToNearestSevenLevel(nextNumericValue)),
    lastEditedMode: "numeric",
  };

  return {
    type: "ratingCellUpdated",
    payload: {
      ratingsMatrix: upsertMatrixCell(
        matrix,
        input.optionId,
        input.criterionId,
        nextCell,
      ),
    },
  };
};

export const rating120SevenLevelCellUpdated = (
  matrix: RatingsMatrixSchema,
  input: {
    optionId: string;
    criterionId: string;
    sevenLevelValue: SevenLevelValue | null;
  },
): RatingAction => {
  const existing = getRating120Cell(matrix, input.optionId, input.criterionId);

  const nextCell: Rating120CellSchema = {
    ...existing,
    sevenLevelValue: input.sevenLevelValue,
    numericValue:
      input.sevenLevelValue === null
        ? existing.numericValue
        : (existing.numericValue ?? mapSevenLevelToNumeric(input.sevenLevelValue)),
    lastEditedMode: "seven_level",
  };

  return {
    type: "ratingCellUpdated",
    payload: {
      ratingsMatrix: upsertMatrixCell(
        matrix,
        input.optionId,
        input.criterionId,
        nextCell,
      ),
    },
  };
};

export const numericMeasuredCellUpdated = (
  matrix: RatingsMatrixSchema,
  input: {
    optionId: string;
    criterionId: string;
    rawValue: number | null;
  },
): RatingAction => {
  const existing = getNumericMeasuredCell(matrix, input.optionId, input.criterionId);

  const nextCell: NumericMeasuredCellSchema = {
    ...existing,
    rawValue: input.rawValue,
  };

  return {
    type: "ratingCellUpdated",
    payload: {
      ratingsMatrix: upsertMatrixCell(
        matrix,
        input.optionId,
        input.criterionId,
        nextCell,
      ),
    },
  };
};

export const criterionWeightUpdated = (
  currentWeights: CriterionWeights,
  input: {
    criterionId: string;
    weight: number | null;
  },
): RatingAction => {
  const nextWeights: CriterionWeights = {
    ...currentWeights,
  };

  if (input.weight === null || !Number.isInteger(input.weight) || input.weight < 1) {
    delete nextWeights[input.criterionId];
  } else {
    nextWeights[input.criterionId] = input.weight;
  }

  return {
    type: "criterionWeightUpdated",
    payload: {
      criterionWeights: nextWeights,
    },
  };
};

const isRatingCellMissing = (
  matrix: RatingsMatrixSchema,
  optionId: string,
  criterionId: string,
): boolean => {
  const cell = matrix[toRatingCellKey(optionId, criterionId)];

  if (!cell) {
    return true;
  }

  if (cell.criterionType === "rating_1_20") {
    return cell.numericValue === null && cell.sevenLevelValue === null;
  }

  return cell.rawValue === null;
};

export const buildMissingRatingsReviewItems = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
): FillMissingReviewItem[] => {
  const reviewItems: FillMissingReviewItem[] = [];

  for (const option of options) {
    for (const criterion of criteria) {
      if (isRatingCellMissing(matrix, option.id, criterion.id)) {
        reviewItems.push({
          optionId: option.id,
          criterionId: criterion.id,
          criterionType: criterion.type,
        });
      }
    }
  }

  return reviewItems;
};

export const ratingMissingNeutralFillApplied = (
  matrix: RatingsMatrixSchema,
  options: DraftOption[],
  criteria: DraftCriterion[],
  mode: RatingInputMode = DEFAULT_RATING_INPUT_MODE,
): RatingAction => {
  let nextMatrix = matrix;

  for (const option of options) {
    for (const criterion of criteria) {
      if (criterion.type !== "rating_1_20") {
        continue;
      }

      if (!isRatingCellMissing(nextMatrix, option.id, criterion.id)) {
        continue;
      }

      const neutralSevenLevel = mapNumericToNearestSevenLevel(NEUTRAL_DESIRABILITY);
      const nextCell: Rating120CellSchema = {
        criterionType: "rating_1_20",
        numericValue: NEUTRAL_DESIRABILITY,
        sevenLevelValue: neutralSevenLevel,
        lastEditedMode: mode,
      };

      nextMatrix = upsertMatrixCell(nextMatrix, option.id, criterion.id, nextCell);
    }
  }

  return {
    type: "ratingMissingNeutralFillApplied",
    payload: {
      ratingsMatrix: nextMatrix,
    },
  };
};
