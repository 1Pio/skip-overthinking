import { createDefaultDecisionDraft, type DecisionDraft } from "./draft.types";
import { criteriaSchema } from "../../criteria/criteria.schema";
import type { CriterionMultiDeleteUndoPayload } from "../../criteria/state/criterion.types";
import {
  criterionWeightsSchema,
  ratingInputModeSchema,
  ratingsMatrixSchema,
} from "../../ratings/ratings.schema";
import {
  DEFAULT_RATING_INPUT_MODE,
  withDefaultCriterionWeights,
} from "../../ratings/state/rating.types";

const DRAFT_STORAGE_KEY = "skip-overthinking:decision-draft:v1";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

const isCriteriaSelection = (value: unknown): boolean => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.isSelecting === "boolean" &&
    isStringArray(value.selectedCriterionIds)
  );
};

const isCriteriaUndoPayload = (
  value: unknown,
): value is CriterionMultiDeleteUndoPayload => {
  if (!isObject(value)) {
    return false;
  }

  return (
    criteriaSchema.safeParse(value.deletedCriteria).success &&
    isStringArray(value.deletedCriterionIds)
  );
};

const isDecisionDraft = (value: unknown): value is DecisionDraft => {
  if (!isObject(value)) {
    return false;
  }

  const {
    decision,
    options,
    criteria,
    ratingsMatrix,
    ratingInputMode,
    criterionWeights,
    criteriaSelection,
    criteriaMultiDeleteUndo,
  } = value;

  if (
    !isObject(decision) ||
    !Array.isArray(options) ||
    !criteriaSchema.safeParse(criteria).success ||
    !ratingsMatrixSchema.safeParse(ratingsMatrix).success ||
    !ratingInputModeSchema.safeParse(ratingInputMode).success ||
    !criterionWeightsSchema.safeParse(criterionWeights).success ||
    !isCriteriaSelection(criteriaSelection)
  ) {
    return false;
  }

  if (
    criteriaMultiDeleteUndo !== null &&
    !isCriteriaUndoPayload(criteriaMultiDeleteUndo)
  ) {
    return false;
  }

  return (
    typeof decision.title === "string" &&
    typeof decision.description === "string" &&
    typeof decision.icon === "string"
  );
};

export const hydrateDraftFromStorage = (): DecisionDraft => {
  if (typeof window === "undefined") {
    return createDefaultDecisionDraft();
  }

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return createDefaultDecisionDraft();
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (isObject(parsed)) {
      const baseDraft = createDefaultDecisionDraft();
      const parsedRatingsMatrix = ratingsMatrixSchema.safeParse(parsed.ratingsMatrix);
      const parsedRatingInputMode = ratingInputModeSchema.safeParse(parsed.ratingInputMode);
      const parsedCriterionWeights = criterionWeightsSchema.safeParse(
        parsed.criterionWeights,
      );
      const migratedDraft: DecisionDraft = {
        ...baseDraft,
        ...parsed,
        ratingsMatrix: parsedRatingsMatrix.success
          ? parsedRatingsMatrix.data
          : baseDraft.ratingsMatrix,
        ratingInputMode: parsedRatingInputMode.success
          ? parsedRatingInputMode.data
          : DEFAULT_RATING_INPUT_MODE,
        criterionWeights: parsedCriterionWeights.success
          ? parsedCriterionWeights.data
          : baseDraft.criterionWeights,
      };

      migratedDraft.criterionWeights = withDefaultCriterionWeights(
        migratedDraft.criteria,
        migratedDraft.criterionWeights,
      );

      if (isDecisionDraft(migratedDraft)) {
        return migratedDraft;
      }
    }

    if (isDecisionDraft(parsed)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  return createDefaultDecisionDraft();
};

export const persistDraftToStorage = (draft: DecisionDraft): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
};

export const clearDraftStorage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
};
