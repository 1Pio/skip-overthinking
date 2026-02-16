import type {
  CriterionSchema,
  CriterionType,
  NumericMeasuredCriterionSchema,
  RawDirection,
  RatingCriterionSchema,
} from "../criteria.schema";

export type DraftCriterion = CriterionSchema;
export type DraftCriterionType = CriterionType;
export type DraftCriterionRawDirection = RawDirection;

export type RatingCriterionDraftInput = {
  type: RatingCriterionSchema["type"];
  title: string;
  description?: string;
};

export type NumericMeasuredCriterionDraftInput = {
  type: NumericMeasuredCriterionSchema["type"];
  title: string;
  description?: string;
  rawDirection: DraftCriterionRawDirection;
  unit?: string;
};

export type CriterionDraftInput =
  | RatingCriterionDraftInput
  | NumericMeasuredCriterionDraftInput;

export type CriterionEditInput = {
  id: string;
  title?: string;
  description?: string;
  type?: DraftCriterionType;
  rawDirection?: DraftCriterionRawDirection;
  unit?: string;
};

export type CriterionSelectionState = {
  isSelecting: boolean;
  selectedCriterionIds: string[];
};

export type CriterionMultiDeleteUndoPayload = {
  deletedCriteria: DraftCriterion[];
  deletedCriterionIds: string[];
};
