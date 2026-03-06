import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  board: z.string().min(2, "Board is required"),
  establishedYear: z.coerce
    .number()
    .min(1800, "Established year seems invalid")
    .max(new Date().getFullYear(), "Established year cannot be in the future"),
  adminName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email("Invalid admin email"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  alternateEmail: z
    .string()
    .optional()
    .refine((val) => !val || /^\S+@\S+\.\S+$/.test(val), {
      message: "Invalid alternate email",
    }),
  address: z.string().min(2, "Address is required"),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  pincode: z
    .string()
    .min(6, "Pincode must be at least 6 digits")
    .regex(/^\d+$/, "Pincode must contain only digits"),
  totalStudents: z.coerce.number().min(1, "Total students is required"),
  totalTeachers: z.coerce.number().min(1, "Total teachers is required"),
  principalName: z.string().min(2, "Principal name is required"),
  premiumType: z
    .string()
    .min(1, "Premium type is required")
    .refine(
      (val) => ["Lite", "Managed", "Premium"].includes(val),
      { message: "Premium type must be Lite, Managed, or Premium" }
    ),
  status: z.enum(["pending", "active", "rejected", "inactive"]).optional(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
