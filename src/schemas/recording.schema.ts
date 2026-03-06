import { z } from "zod";

export const createRecordingSchema = z.object({
  name: z.string().min(1, "Recording name is required").trim(),
  link: z.string().min(1, "Recording link is required").trim().url("Invalid URL format"),
  description: z.string().optional(),
  duration: z.string().min(1, "Duration is required").trim(),
  type: z.enum(["job", "subject"]),
  topicId: z.string().optional(),
  subjectId: z.string().optional(),
  jobId: z.string().optional(),
  skillId: z.string().optional(),
});

export type CreateRecordingInput = z.infer<typeof createRecordingSchema>;

