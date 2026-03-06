import { z } from 'zod';

export const createTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required").trim(),
  description: z.string().optional(),
  difficultyLevel: z.enum(["Easy", "Medium", "Hard"], {
    message: "Difficulty level must be Easy, Medium, or Hard"
  }),
  organizationId: z.string().min(1, "Organization ID is required"),
  departmentId: z.string().optional(),
  subjectId: z.string().min(1, "Subject ID is required")
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const createBatchTopicsSchema = z.object({
  topics: z.array(createTopicSchema).min(1, 'At least one topic is required').max(50, 'Maximum 50 topics allowed per batch'),
});

export type CreateBatchTopicsInput = z.infer<typeof createBatchTopicsSchema>;
