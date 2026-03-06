import { z } from "zod";

export const createCVProjectSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  type: z.string().min(1, "Type is required").trim(),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
  description: z.string().min(1, "Description is required").trim(),
});

export const updateCVProjectSchema = createCVProjectSchema.partial();

export type CreateCVProjectInput = z.infer<typeof createCVProjectSchema>;
export type UpdateCVProjectInput = z.infer<typeof updateCVProjectSchema>;

