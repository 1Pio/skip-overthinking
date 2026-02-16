import type { DraftOption } from "./option.types";

import { optionsGateSchema } from "../optionsGate.schema";

export const hasMinimumOptions = (options: DraftOption[]): boolean =>
  optionsGateSchema.safeParse({ options }).success;

export const isOptionsStepComplete = (options: DraftOption[]): boolean =>
  hasMinimumOptions(options);
