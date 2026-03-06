import { z } from "zod";

export const createVirtualSessionSchema = z
  .object({
    name: z.string().min(1, "Session name is required").trim(),
    meetLink: z.string().trim().optional(),
    date: z.string().min(1, "Date is required").trim(),
    time: z.string().min(1, "Time is required").trim(),
    sessionType: z.enum(["academic", "job"]),
    organizationId: z.string().min(1, "Organization ID is required").trim(),
    isRecurring: z.boolean().optional().default(false),
    frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]).optional(),
    subjectId: z.string().trim().optional(),
    jobId: z.string().trim().optional(),
    skillIds: z.array(z.string().trim()).optional(),
    inviteeUserIds: z.array(z.string().trim()).min(1, "At least one invitee is required"),
    inviteeEmails: z.array(z.string().trim()).optional(),
    createdBy: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.sessionType === "academic") {
        return !!data.subjectId;
      }
      return true;
    },
    { message: "Subject is required for academic sessions", path: ["subjectId"] }
  )
  .refine(
    (data) => {
      if (data.sessionType === "job") {
        return !!data.jobId && Array.isArray(data.skillIds) && data.skillIds.length > 0;
      }
      return true;
    },
    { message: "Job and at least one skill are required for job sessions", path: ["jobId"] }
  )
  .refine(
    (data) => {
      if (data.isRecurring && !data.frequency) return false;
      return true;
    },
    { message: "Frequency is required for recurring sessions", path: ["frequency"] }
  );

export type CreateVirtualSessionInput = z.infer<typeof createVirtualSessionSchema>;

export const updateVirtualSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").trim().optional(),
  meetLink: z.string().trim().optional().nullable(),
  date: z.string().min(1, "Date is required").trim().optional(),
  time: z.string().min(1, "Time is required").trim().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]).optional().nullable(),
});

export type UpdateVirtualSessionInput = z.infer<typeof updateVirtualSessionSchema>;
