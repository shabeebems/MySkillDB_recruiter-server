import { z } from "zod";

export const createOrUpdateCVProfileSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").min(1, "Email is required").trim(),
  mobile: z.string().min(1, "Mobile is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  linkedIn: z.string().trim().optional(),
  github: z.string().trim().optional(),
  portfolio: z.string().trim().optional(),
  aboutMe: z.string().min(1, "About me is required").trim(),
  emailIcon: z.string().trim().optional(),
  phoneIcon: z.string().trim().optional(),
  addressIcon: z.string().trim().optional(),
  emailIconColor: z.string().trim().optional(),
  phoneIconColor: z.string().trim().optional(),
  addressIconColor: z.string().trim().optional(),
  linkedinIconColor: z.string().trim().optional(),
  githubIconColor: z.string().trim().optional(),
  portfolioIconColor: z.string().trim().optional(),
  sectionOrder: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  customSections: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).trim(),
    entries: z.array(z.object({
      id: z.string(),
      title: z.string().trim(),
      subtitle: z.string().trim().optional(),
      description: z.string().trim().optional(),
    })),
  })).optional(),
});

export type CreateOrUpdateCVProfileInput = z.infer<typeof createOrUpdateCVProfileSchema>;

