import { z } from "zod";

export const systemSettingSchema = z.object({
  value: z
    .string()
    .min(2, "Value must be at least 2 characters"),
});

export type SystemSettingInput = z.infer<typeof systemSettingSchema>;
