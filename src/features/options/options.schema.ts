import { z } from "zod";

const optionalTextSchema = z.string().trim().optional();

export const optionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Option title is required"),
  description: optionalTextSchema,
  icon: optionalTextSchema,
  order: z.number().int().nonnegative(),
});

export const optionInputSchema = z.object({
  title: z.string().trim().min(1, "Option title is required"),
  description: optionalTextSchema,
  icon: optionalTextSchema,
});

export type OptionSchema = z.infer<typeof optionSchema>;
export type OptionInputSchema = z.infer<typeof optionInputSchema>;
