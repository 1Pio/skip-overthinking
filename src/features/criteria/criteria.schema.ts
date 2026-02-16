import { z } from "zod";

const optionalTextSchema = z.string().trim().optional();

export const criterionTypeSchema = z.enum(["rating_1_20", "numeric_measured"]);
export const rawDirectionSchema = z.enum([
  "lower_raw_better",
  "higher_raw_better",
]);

export const criteriaDesirabilityInvariant =
  "Every criterion expresses desirability on a 1-20 scale where higher is better and 0 is never valid.";

const criterionBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Criterion title is required"),
  description: optionalTextSchema,
  order: z.number().int().nonnegative(),
});

export const ratingCriterionSchema = criterionBaseSchema.extend({
  type: z.literal("rating_1_20"),
});

export const numericMeasuredCriterionSchema = criterionBaseSchema.extend({
  type: z.literal("numeric_measured"),
  rawDirection: rawDirectionSchema,
  unit: optionalTextSchema,
});

export const criterionSchema = z.discriminatedUnion("type", [
  ratingCriterionSchema,
  numericMeasuredCriterionSchema,
]);

export const criteriaSchema = z.array(criterionSchema);

export type CriterionType = z.infer<typeof criterionTypeSchema>;
export type RawDirection = z.infer<typeof rawDirectionSchema>;
export type RatingCriterionSchema = z.infer<typeof ratingCriterionSchema>;
export type NumericMeasuredCriterionSchema = z.infer<
  typeof numericMeasuredCriterionSchema
>;
export type CriterionSchema = z.infer<typeof criterionSchema>;
