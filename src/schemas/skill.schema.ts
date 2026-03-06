import { z } from 'zod';

export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").trim(),
  description: z.string().optional(),
  type: z.enum(["technical", "tools", "soft", "other"], {
    message: "Skill type must be technical, tools, soft, or other"
  }),
  organizationId: z.string().min(1, "Organization ID is required"),
  departmentId: z.string().optional(),
  jobId: z.string().min(1, "Job ID is required")
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

