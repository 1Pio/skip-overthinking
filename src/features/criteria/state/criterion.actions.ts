import type {
  CriterionDraftInput,
  CriterionEditInput,
  CriterionMultiDeleteUndoPayload,
  DraftCriterion,
} from "./criterion.types";

export type CriterionMoveDirection = "up" | "down";

export type CriterionAction =
  | {
      type: "criterionAdded";
      payload: {
        criteria: DraftCriterion[];
      };
    }
  | {
      type: "criterionEdited";
      payload: {
        criteria: DraftCriterion[];
      };
    }
  | {
      type: "criterionDeleted";
      payload: {
        criteria: DraftCriterion[];
      };
    }
  | {
      type: "criterionReordered";
      payload: {
        criteria: DraftCriterion[];
      };
    }
  | {
      type: "criterionSelectionModeEntered";
      payload: {
        selectedCriterionIds: string[];
      };
    }
  | {
      type: "criterionSelectionModeCleared";
      payload: {
        selectedCriterionIds: string[];
      };
    }
  | {
      type: "criterionMultiDeleted";
      payload: {
        criteria: DraftCriterion[];
        undo: CriterionMultiDeleteUndoPayload;
      };
    }
  | {
      type: "criterionMultiDeleteUndone";
      payload: {
        criteria: DraftCriterion[];
        undo: null;
      };
    };

const createCriterionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `criterion-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const toOptionalText = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeCriteria = (criteria: DraftCriterion[]): DraftCriterion[] =>
  [...criteria]
    .sort((left, right) => left.order - right.order)
    .map((criterion, index) => ({
      ...criterion,
      order: index,
    }));

const reindexCriteria = (criteria: DraftCriterion[]): DraftCriterion[] =>
  criteria.map((criterion, index) => ({
    ...criterion,
    order: index,
  }));

type CriterionReorderInput = {
  id: string;
  direction: CriterionMoveDirection;
};

const createCriterionFromInput = (
  input: CriterionDraftInput,
  order: number,
): DraftCriterion => {
  if (input.type === "numeric_measured") {
    return {
      id: createCriterionId(),
      title: input.title.trim(),
      description: toOptionalText(input.description),
      order,
      type: "numeric_measured",
      rawDirection: input.rawDirection,
      unit: toOptionalText(input.unit),
    };
  }

  return {
    id: createCriterionId(),
    title: input.title.trim(),
    description: toOptionalText(input.description),
    order,
    type: "rating_1_20",
  };
};

export const criterionAdded = (
  currentCriteria: DraftCriterion[],
  input: CriterionDraftInput,
): CriterionAction => {
  const orderedCriteria = normalizeCriteria(currentCriteria);
  const nextCriteria = normalizeCriteria([
    ...orderedCriteria,
    createCriterionFromInput(input, orderedCriteria.length),
  ]);

  return {
    type: "criterionAdded",
    payload: {
      criteria: nextCriteria,
    },
  };
};

const applyCriterionEdit = (
  criterion: DraftCriterion,
  input: CriterionEditInput,
): DraftCriterion => {
  const title = input.title !== undefined ? input.title.trim() : criterion.title;
  const description =
    input.description !== undefined
      ? toOptionalText(input.description)
      : criterion.description;
  const targetType = input.type ?? criterion.type;

  if (targetType === "numeric_measured") {
    const currentRawDirection =
      criterion.type === "numeric_measured"
        ? criterion.rawDirection
        : "higher_raw_better";
    const currentUnit = criterion.type === "numeric_measured" ? criterion.unit : undefined;

    return {
      id: criterion.id,
      title,
      description,
      order: criterion.order,
      type: "numeric_measured",
      rawDirection: input.rawDirection ?? currentRawDirection,
      unit: input.unit !== undefined ? toOptionalText(input.unit) : currentUnit,
    };
  }

  return {
    id: criterion.id,
    title,
    description,
    order: criterion.order,
    type: "rating_1_20",
  };
};

export const criterionEdited = (
  currentCriteria: DraftCriterion[],
  input: CriterionEditInput,
): CriterionAction => {
  const nextCriteria = normalizeCriteria(
    currentCriteria.map((criterion) =>
      criterion.id === input.id ? applyCriterionEdit(criterion, input) : criterion,
    ),
  );

  return {
    type: "criterionEdited",
    payload: {
      criteria: nextCriteria,
    },
  };
};

export const criterionDeleted = (
  currentCriteria: DraftCriterion[],
  criterionId: string,
): CriterionAction => {
  const nextCriteria = normalizeCriteria(
    currentCriteria.filter((criterion) => criterion.id !== criterionId),
  );

  return {
    type: "criterionDeleted",
    payload: {
      criteria: nextCriteria,
    },
  };
};

const resolveTargetIndex = (
  currentIndex: number,
  total: number,
  direction: CriterionMoveDirection,
): number => {
  switch (direction) {
    case "up":
      return Math.max(0, currentIndex - 1);
    case "down":
      return Math.min(total - 1, currentIndex + 1);
  }
};

export const criterionReordered = (
  currentCriteria: DraftCriterion[],
  input: CriterionReorderInput,
): CriterionAction => {
  const orderedCriteria = normalizeCriteria(currentCriteria);
  const sourceIndex = orderedCriteria.findIndex(
    (criterion) => criterion.id === input.id,
  );

  if (sourceIndex === -1) {
    return {
      type: "criterionReordered",
      payload: {
        criteria: orderedCriteria,
      },
    };
  }

  const targetIndex = resolveTargetIndex(
    sourceIndex,
    orderedCriteria.length,
    input.direction,
  );

  if (targetIndex === sourceIndex) {
    return {
      type: "criterionReordered",
      payload: {
        criteria: orderedCriteria,
      },
    };
  }

  const nextCriteria = [...orderedCriteria];
  const [movedCriterion] = nextCriteria.splice(sourceIndex, 1);
  nextCriteria.splice(targetIndex, 0, movedCriterion);

  return {
    type: "criterionReordered",
    payload: {
      criteria: reindexCriteria(nextCriteria),
    },
  };
};

export const criterionSelectionModeEntered = (
  selectedCriterionIds: string[],
): CriterionAction => ({
  type: "criterionSelectionModeEntered",
  payload: {
    selectedCriterionIds: [...new Set(selectedCriterionIds)],
  },
});

export const criterionSelectionModeCleared = (): CriterionAction => ({
  type: "criterionSelectionModeCleared",
  payload: {
    selectedCriterionIds: [],
  },
});

export const criterionMultiDeleted = (
  currentCriteria: DraftCriterion[],
  criterionIds: string[],
): CriterionAction => {
  const orderedCriteria = normalizeCriteria(currentCriteria);
  const criterionIdSet = new Set(criterionIds);
  const deletedCriteria = orderedCriteria.filter((criterion) =>
    criterionIdSet.has(criterion.id),
  );
  const nextCriteria = normalizeCriteria(
    orderedCriteria.filter((criterion) => !criterionIdSet.has(criterion.id)),
  );

  return {
    type: "criterionMultiDeleted",
    payload: {
      criteria: nextCriteria,
      undo: {
        deletedCriteria,
        deletedCriterionIds: [...criterionIdSet],
      },
    },
  };
};

export const criterionMultiDeleteUndone = (
  currentCriteria: DraftCriterion[],
  undo: CriterionMultiDeleteUndoPayload | null,
): CriterionAction => {
  if (!undo) {
    return {
      type: "criterionMultiDeleteUndone",
      payload: {
        criteria: normalizeCriteria(currentCriteria),
        undo: null,
      },
    };
  }

  return {
    type: "criterionMultiDeleteUndone",
    payload: {
      criteria: normalizeCriteria([...currentCriteria, ...undo.deletedCriteria]),
      undo: null,
    },
  };
};
