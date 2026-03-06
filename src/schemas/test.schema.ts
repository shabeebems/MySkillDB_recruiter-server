import { z } from "zod";

const questionInputSchema = z.object({
  questionText: z.string().min(1, "Question text is required").trim(),
  options: z
    .array(z.string().min(1).trim())
    .min(2, "At least two options are required"),
  topicId: z.string().min(1).trim().optional(), // For subject topics
  skillId: z.string().min(1).trim().optional(), // For job skills
  difficultyLevel: z
    .enum(["Easy", "Medium", "Hard"]) // optional, will default to test difficulty if omitted
    .optional(),
  correctAnswer: z.string().min(1, "Correct answer is required").trim(),
}).refine(
  (data) => data.topicId || data.skillId,
  {
    message: "Either topicId or skillId must be provided",
    path: ["topicId", "skillId"],
  }
);

export const createTestSchema = z
  .object({
    name: z.string().min(1, "Test name is required").trim(),
    description: z.string().min(1, "Description is required").trim(),
    subjectId: z.string().min(1).trim().optional(),
    topicId: z.string().min(1).trim().optional(),
    jobId: z.string().min(1).trim().optional(),
    skillId: z.string().min(1).trim().optional(), // For job skill-level tests
    difficultyLevel: z.enum(["Easy", "Medium", "Hard"]),
    organizationId: z.string().min(1, "Organization ID is required").trim(),
    teacherId: z.string().optional(),
    questionCount: z.number().int().min(0).optional(),
    questions: z
      .array(questionInputSchema)
      .min(1, "At least one question is required"),
  })
  .superRefine((val, ctx) => {
    // Ensure each question's correctAnswer exists in its options
    val.questions.forEach((q, idx) => {
      if (!q.options.includes(q.correctAnswer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", idx, "correctAnswer"],
          message: "Correct answer must be one of the provided options",
        });
      }
    });
  });

// Update schema - all fields optional except validation rules
const updateQuestionInputSchema = z.object({
  _id: z.string().optional(), // For existing questions
  id: z.string().optional(), // Alternative field name
  questionText: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().min(1, "Question text is required").trim().optional()
  ),
  question: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().min(1, "Question text is required").trim().optional()
  ), // Alternative field name
  options: z
    .array(z.string().min(1).trim())
    .min(2, "At least two options are required")
    .optional(),
  topicId: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().min(1).trim().optional()
  ),
  skillId: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().min(1).trim().optional()
  ),
  difficultyLevel: z
    .enum(["Easy", "Medium", "Hard"])
    .optional(),
  correctAnswer: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().min(1, "Correct answer is required").trim().optional()
  ),
}).refine(
  (data) => {
    // Only validate if questionText or question is actually provided (not undefined)
    // After preprocessing, empty strings become undefined, so we only check if the field exists
    const hasQuestionText = data.questionText !== undefined || data.question !== undefined;
    
    if (hasQuestionText) {
      // If question text is being updated, ensure options and correctAnswer are also provided
      if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
        return false;
      }
      if (data.correctAnswer === undefined || 
          (typeof data.correctAnswer === 'string' && data.correctAnswer.trim() === "")) {
        return false;
      }
    }
    return true; // If no question text, allow partial update
  },
  {
    message: "If updating question text, options (at least 2) and correct answer are required",
    path: ["options"],
  }
);

export const updateTestSchema = z
  .object({
    name: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1, "Test name is required").trim().optional()
    ),
    description: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1, "Description is required").trim().optional()
    ).optional(),
    subjectId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1).trim().optional()
    ),
    topicId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1).trim().optional()
    ),
    jobId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1).trim().optional()
    ),
    skillId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1).trim().optional()
    ),
    difficultyLevel: z.enum(["Easy", "Medium", "Hard"]).optional(),
    organizationId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().min(1).trim().optional()
    ),
    teacherId: z.string().optional(),
    questionCount: z.number().int().min(0).optional(),
    questions: z
      .array(updateQuestionInputSchema)
      .min(1, "At least one question is required")
      .optional(),
  })
  .superRefine((val, ctx) => {
    // Validate questions if provided
    if (val.questions) {
      val.questions.forEach((q, idx) => {
        // Ensure correctAnswer exists in options if both are provided
        if (q.options && q.correctAnswer && !q.options.includes(q.correctAnswer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "correctAnswer"],
            message: "Correct answer must be one of the provided options",
          });
        }
        // Ensure question text is provided if question is being updated
        // This is already handled by the optional() and min(1) in the schema
      });
    }
  });

export type CreateTestInput = z.infer<typeof createTestSchema>;
export type UpdateTestInput = z.infer<typeof updateTestSchema>;


