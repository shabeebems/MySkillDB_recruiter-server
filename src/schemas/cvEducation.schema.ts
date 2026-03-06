import { z } from "zod";

export const createCVEducationSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  institution: z.string().min(1, "Institution is required").trim(),
  location: z.string().min(1, "Location is required").trim(),
  startYear: z.string().min(1, "Start year is required").trim(),
  endYear: z.string().min(1, "End year is required").trim(),
  gpa: z.string().trim().optional(),
});

export const updateCVEducationSchema = createCVEducationSchema.partial();

export type CreateCVEducationInput = z.infer<typeof createCVEducationSchema>;
export type UpdateCVEducationInput = z.infer<typeof updateCVEducationSchema>;

