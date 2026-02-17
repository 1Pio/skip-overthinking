import { z } from "zod";

export const RATING_CELL_KEY_SEPARATOR = "::";

export const DESIRABILITY_MIN = 1;
export const DESIRABILITY_MAX = 20;
export const NEUTRAL_DESIRABILITY = 10;
export const MEASURED_EQUAL_RAW_NEUTRAL_DESIRABILITY = 10.5;

export const OPTION_COVERAGE_WARNING_THRESHOLD = 0.7;
export const OPTION_COVERAGE_STRONG_WARNING_THRESHOLD = 0.5;
export const CRITERION_BLANK_RATE_SOFT_WARNING_THRESHOLD = 0.3;

export const desirabilityValueSchema = z
  .number()
  .finite()
  .min(DESIRABILITY_MIN)
  .max(DESIRABILITY_MAX);

export const ratingInputModeSchema = z.enum(["numeric", "seven_level"]);

export const sevenLevelValueSchema = z.enum([
  "terrible",
  "very_poor",
  "poor",
  "ok",
  "good",
  "very_good",
  "excellent",
]);

export const rating120CellSchema = z.object({
  criterionType: z.literal("rating_1_20"),
  numericValue: desirabilityValueSchema.nullable(),
  sevenLevelValue: sevenLevelValueSchema.nullable(),
  lastEditedMode: ratingInputModeSchema.nullable(),
});

export const numericMeasuredCellSchema = z.object({
  criterionType: z.literal("numeric_measured"),
  rawValue: z.number().finite().nullable(),
});

export const ratingMatrixCellSchema = z.discriminatedUnion("criterionType", [
  rating120CellSchema,
  numericMeasuredCellSchema,
]);

export const ratingsMatrixSchema = z.record(z.string().min(1), ratingMatrixCellSchema);

export const criterionWeightSchema = z.number().int().min(1);

export const criterionWeightsSchema = z.record(z.string().min(1), criterionWeightSchema);

export const toDesirabilityValueOrNull = (value: number | null): number | null => {
  if (value === null) {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  if (value < DESIRABILITY_MIN || value > DESIRABILITY_MAX) {
    return null;
  }

  return value;
};

export const clampDesirabilityValue = (value: number): number =>
  Math.min(DESIRABILITY_MAX, Math.max(DESIRABILITY_MIN, value));

export type RatingInputModeSchema = z.infer<typeof ratingInputModeSchema>;
export type SevenLevelValueSchema = z.infer<typeof sevenLevelValueSchema>;
export type Rating120CellSchema = z.infer<typeof rating120CellSchema>;
export type NumericMeasuredCellSchema = z.infer<typeof numericMeasuredCellSchema>;
export type RatingMatrixCellSchema = z.infer<typeof ratingMatrixCellSchema>;
export type RatingsMatrixSchema = z.infer<typeof ratingsMatrixSchema>;
export type CriterionWeightSchema = z.infer<typeof criterionWeightSchema>;
export type CriterionWeightsSchema = z.infer<typeof criterionWeightsSchema>;
