import { z } from "zod";

import { criterionSchema } from "./criteria.schema";

export const criteriaGateSchema = z.object({
  criteria: z.array(criterionSchema).min(1, "At least one criterion is required"),
});

export type CriteriaGateSchema = z.infer<typeof criteriaGateSchema>;
