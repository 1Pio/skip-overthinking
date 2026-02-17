import { z } from "zod";

import { criterionWeightSchema } from "./ratings.schema";

export const ratingsGateSchema = z.object({
  criteria: z
    .array(
      z.object({
        id: z.string().min(1),
        weight: criterionWeightSchema,
      }),
    )
    .min(1, "At least one weighted criterion is required"),
  allWeightsAssigned: z.literal(true),
});

export type RatingsGateSchema = z.infer<typeof ratingsGateSchema>;
