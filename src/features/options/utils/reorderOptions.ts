import type { DraftOption } from "../state/option.types";

export const reorderOptions = (options: DraftOption[]): DraftOption[] =>
  [...options]
    .sort((left, right) => left.order - right.order)
    .map((option, index) => ({
      ...option,
      order: index,
    }));
