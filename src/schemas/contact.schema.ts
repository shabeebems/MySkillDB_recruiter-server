import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z
    .union([z.string().email("Invalid email address"), z.literal("")])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  mobile: z.string().optional(),
  designation: z
    .enum(["mentor", "founder", "hr", "other"])
    .optional(),
  organization: z.string().trim().optional(),
  linkedin: z
    .union([z.string().url("Invalid LinkedIn URL"), z.literal("")])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  note: z.string().trim().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
