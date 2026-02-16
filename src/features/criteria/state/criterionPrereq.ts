import { criteriaGateSchema } from "../criteriaGate.schema";

import type { DraftCriterion } from "./criterion.types";

export const hasMinimumCriteria = (criteria: DraftCriterion[]): boolean =>
  criteriaGateSchema.safeParse({ criteria }).success;

export const isCriteriaStepComplete = (criteria: DraftCriterion[]): boolean =>
  hasMinimumCriteria(criteria);
