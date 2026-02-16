import { z } from "zod";

export const decisionSetupSchema = z.object({
  title: z.string().trim().min(1, "Decision title is required"),
  description: z.string(),
  icon: z.string(),
});

export type DecisionSetupValues = z.infer<typeof decisionSetupSchema>;
