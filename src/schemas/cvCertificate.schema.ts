import { z } from "zod";

export const createCVCertificateSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  issuer: z.string().min(1, "Issuer is required").trim(),
  year: z.string().min(1, "Year is required").trim(),
});

export const updateCVCertificateSchema = createCVCertificateSchema.partial();

export type CreateCVCertificateInput = z.infer<typeof createCVCertificateSchema>;
export type UpdateCVCertificateInput = z.infer<typeof updateCVCertificateSchema>;

