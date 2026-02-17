import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { CriterionWeights } from "./rating.types";

import { ratingsGateSchema } from "../ratingsGate.schema";

export const hasCompleteIntegerWeights = (
  criteria: DraftCriterion[],
  criterionWeights: CriterionWeights,
): boolean => {
  const criteriaWithWeights = criteria.map((criterion) => ({
    id: criterion.id,
    weight: criterionWeights[criterion.id],
  }));

  return ratingsGateSchema.safeParse({
    criteria: criteriaWithWeights,
    allWeightsAssigned: criteriaWithWeights.every(
      (criterion) => typeof criterion.weight === "number",
    ),
  }).success;
};

export const isRatingsStepComplete = (
  criteria: DraftCriterion[],
  criterionWeights: CriterionWeights,
): boolean => hasCompleteIntegerWeights(criteria, criterionWeights);
