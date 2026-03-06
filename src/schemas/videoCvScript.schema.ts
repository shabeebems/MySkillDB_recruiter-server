import { z } from "zod";

export const createVideoCvScriptSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").trim(),
  userReasons: z.string().trim().optional(),
  videoDuration: z.enum(['1-2', '2-3', '5-7', '8-10'], {
    message: "Video duration must be one of: 1-2, 2-3, 5-7, 8-10",
  }),
  tips: z.array(z.string()).optional(),
  sections: z.array(
    z.object({
      timestamp: z.string().min(1, "Timestamp is required"),
      section: z.string().min(1, "Section title is required"),
      script: z.string().min(1, "Script content is required"),
    })
  ).min(1, "At least one section is required"),
});

export type CreateVideoCvScriptInput = z.infer<typeof createVideoCvScriptSchema>;

