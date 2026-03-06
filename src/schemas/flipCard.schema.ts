import { z } from 'zod';

export const createFlipCardSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  jobId: z.string().min(1, 'Job ID is required'),
  skillId: z.string().min(1, 'Skill ID is required'),
  heading: z.string().min(1, 'Heading is required').trim(),
  content: z.string().min(1, 'Content is required').trim(),
  keypoints: z.array(z.string()).optional().default([]),
  question: z.string().min(1, 'Question is required').trim(),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options are required')
    .max(6, 'Maximum 6 options allowed'),
  correctAnswer: z.string().min(1, 'Correct answer is required').trim(),
});

export type CreateFlipCardInput = z.infer<typeof createFlipCardSchema>;

export const updateFlipCardSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required').optional(),
  jobId: z.string().min(1, 'Job ID is required').optional(),
  skillId: z.string().min(1, 'Skill ID is required').optional(),
  heading: z.string().min(1, 'Heading is required').trim().optional(),
  content: z.string().min(1, 'Content is required').trim().optional(),
  keypoints: z.array(z.string()).optional(),
  question: z.string().min(1, 'Question is required').trim().optional(),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options are required')
    .max(6, 'Maximum 6 options allowed')
    .optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required').trim().optional(),
}).refine(
  (data) => {
    // If both options and correctAnswer are provided, correctAnswer must be in options
    if (data.options && data.correctAnswer) {
      return data.options.includes(data.correctAnswer);
    }
    return true;
  },
  {
    message: "Correct answer must be one of the provided options",
    path: ["correctAnswer"],
  }
);

export type UpdateFlipCardInput = z.infer<typeof updateFlipCardSchema>;

export const createBatchFlipCardsSchema = z.object({
  flipCards: z.array(createFlipCardSchema).min(1, 'At least one flip card is required').max(10, 'Maximum 10 flip cards allowed per batch'),
});

export type CreateBatchFlipCardsInput = z.infer<typeof createBatchFlipCardsSchema>;

