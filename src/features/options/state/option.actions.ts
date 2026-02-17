import { reorderOptions } from "../utils/reorderOptions";

import type { OptionDraftInput, DraftOption } from "./option.types";

export type OptionMoveDirection = "up" | "down" | "top" | "bottom";

export type OptionAction =
  | {
      type: "optionAdded";
      payload: {
        options: DraftOption[];
      };
    }
  | {
      type: "optionEdited";
      payload: {
        options: DraftOption[];
      };
    }
  | {
      type: "optionDeleted";
      payload: {
        options: DraftOption[];
      };
    }
  | {
      type: "optionReordered";
      payload: {
        options: DraftOption[];
      };
    };

const createOptionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `option-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const toOptionalText = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

type OptionEditInput = {
  id: string;
} & Partial<OptionDraftInput>;

type OptionReorderInput = {
  id: string;
  direction: OptionMoveDirection;
};

const reindexOptions = (options: DraftOption[]): DraftOption[] =>
  options.map((option, index) => ({
    ...option,
    order: index,
  }));

export const optionAdded = (
  currentOptions: DraftOption[],
  input: OptionDraftInput,
): OptionAction => {
  const orderedOptions = reorderOptions(currentOptions);
  const nextOptions = reorderOptions([
    ...orderedOptions,
    {
      id: createOptionId(),
      title: input.title.trim(),
      description: toOptionalText(input.description),
      icon: toOptionalText(input.icon),
      order: orderedOptions.length,
    },
  ]);

  return {
    type: "optionAdded",
    payload: {
      options: nextOptions,
    },
  };
};

export const optionEdited = (
  currentOptions: DraftOption[],
  input: OptionEditInput,
): OptionAction => {
  const nextOptions = reorderOptions(
    currentOptions.map((option) => {
      if (option.id !== input.id) {
        return option;
      }

      return {
        ...option,
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.description !== undefined
          ? { description: toOptionalText(input.description) }
          : {}),
        ...(input.icon !== undefined ? { icon: toOptionalText(input.icon) } : {}),
      };
    }),
  );

  return {
    type: "optionEdited",
    payload: {
      options: nextOptions,
    },
  };
};

export const optionDeleted = (
  currentOptions: DraftOption[],
  optionId: string,
): OptionAction => {
  const nextOptions = reorderOptions(
    currentOptions.filter((option) => option.id !== optionId),
  );

  return {
    type: "optionDeleted",
    payload: {
      options: nextOptions,
    },
  };
};

const resolveTargetIndex = (
  currentIndex: number,
  total: number,
  direction: OptionMoveDirection,
): number => {
  switch (direction) {
    case "up":
      return Math.max(0, currentIndex - 1);
    case "down":
      return Math.min(total - 1, currentIndex + 1);
    case "top":
      return 0;
    case "bottom":
      return total - 1;
  }
};

export const optionReordered = (
  currentOptions: DraftOption[],
  input: OptionReorderInput,
): OptionAction => {
  const orderedOptions = reorderOptions(currentOptions);
  const sourceIndex = orderedOptions.findIndex((option) => option.id === input.id);

  if (sourceIndex === -1) {
    return {
      type: "optionReordered",
      payload: {
        options: orderedOptions,
      },
    };
  }

  const targetIndex = resolveTargetIndex(
    sourceIndex,
    orderedOptions.length,
    input.direction,
  );

  if (targetIndex === sourceIndex) {
    return {
      type: "optionReordered",
      payload: {
        options: orderedOptions,
      },
    };
  }

  const nextOptions = [...orderedOptions];
  const [movedOption] = nextOptions.splice(sourceIndex, 1);
  nextOptions.splice(targetIndex, 0, movedOption);

  return {
    type: "optionReordered",
    payload: {
      options: reindexOptions(nextOptions),
    },
  };
};
