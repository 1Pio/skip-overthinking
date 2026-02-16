import { z } from "zod";

import { optionSchema } from "./options.schema";

export const optionsGateSchema = z.object({
  options: z.array(optionSchema).min(2, "At least two options are required"),
});

export type OptionsGateSchema = z.infer<typeof optionsGateSchema>;
