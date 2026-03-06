import { z } from "zod";

export const createEmailHrSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  companyName: z.string().min(1, "Company name is required").trim(),
  destination: z.string().min(1, "Destination is required").trim(),
  jobId: z.string().min(1, "Job ID is required").trim(),
});

export type CreateEmailHrInput = z.infer<typeof createEmailHrSchema>;

