import { z } from "zod";

export const createJobApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").trim(),
});

export type CreateJobApplicationInput = z.infer<typeof createJobApplicationSchema>;

