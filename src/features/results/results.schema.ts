import { z } from "zod";

export const RESULT_METHODS = ["wsm", "wpm"] as const;
export const METHOD_CHECK_STATES = [
  "agree",
  "differ",
  "insufficient_data",
] as const;

export const resultMethodSchema = z.enum(RESULT_METHODS);
export const methodCheckStateSchema = z.enum(METHOD_CHECK_STATES);

export const RESULTS_DOMAIN_CONSTANTS = {
  wsmMinInput: 1,
  wsmMaxInput: 20,
  wsmRange: 19,
  wpmDivisor: 20,
  scorePrecision: 6,
  tieEpsilon: 1e-9,
} as const;

export type ResultMethodSchema = z.infer<typeof resultMethodSchema>;
export type MethodCheckStateSchema = z.infer<typeof methodCheckStateSchema>;
