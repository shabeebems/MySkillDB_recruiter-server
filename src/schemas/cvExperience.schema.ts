import { z } from "zod";

export const createCVExperienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required").trim(),
  company: z.string().min(1, "Company is required").trim(),
  location: z.string().min(1, "Location is required").trim(),
  startDate: z.string().min(1, "Start date is required").trim(),
  endDate: z.string().trim().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1, "Description is required").trim(),
});

export const updateCVExperienceSchema = createCVExperienceSchema.partial();

export type CreateCVExperienceInput = z.infer<typeof createCVExperienceSchema>;
export type UpdateCVExperienceInput = z.infer<typeof updateCVExperienceSchema>;

