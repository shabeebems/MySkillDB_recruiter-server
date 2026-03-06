import { z } from "zod";

export const createJobSchema = z.object({
  name: z.string().min(1, "Job name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  companyName: z.string().min(1, "Company name is required").trim(),
  departmentIds: z.array(z.string()).optional(),
  place: z.string().min(1, "Place is required").trim(),
  salaryRange: z.string().trim().optional(),
  requirements: z.array(z.string().trim()).optional(),
  organizationId: z.string().min(1, "Organization ID is required").trim(),
}).refine(data => data.departmentIds && data.departmentIds.length > 0, {
  message: "At least one department must be selected",
  path: ["departmentIds"]
});

export const updateJobSchema = z.object({
  name: z.string().min(1, "Job name is required").trim().optional(),
  description: z.string().min(1, "Description is required").trim().optional(),
  companyName: z.string().min(1, "Company name is required").trim().optional(),
  departmentIds: z.array(z.string()).optional(),
  place: z.string().min(1, "Place is required").trim().optional(),
  salaryRange: z.string().trim().optional(),
  requirements: z.array(z.string().trim()).optional(),
  organizationId: z.string().min(1, "Organization ID is required").trim().optional(),
}).refine(data => !data.departmentIds || data.departmentIds.length > 0, {
  message: "At least one department must be selected",
  path: ["departmentIds"]
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
