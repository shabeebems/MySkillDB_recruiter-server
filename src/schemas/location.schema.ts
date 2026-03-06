import { z } from "zod";

// Country schema
export const countrySchema = z.object({
  country: z.string().min(2, "Country name is required"),
  countryCode: z.string().min(2, "Country code is required"),
});

// State schema
export const stateSchema = z.object({
  state: z.string().min(2, "State name is required"),
  stateCode: z.string().min(2, "State code is required"),
  countryCode: z.string().min(2, "Country code is required"),
});

// District schema
export const districtSchema = z.object({
  district: z.string().min(2, "District name is required"),
  districtCode: z.string().min(2, "District code is required"),
  stateCode: z.string().min(2, "State code is required"),
  countryCode: z.string().min(2, "Country code is required"),
});

// Types
export type CountryInput = z.infer<typeof countrySchema>;
export type StateInput = z.infer<typeof stateSchema>;
export type DistrictInput = z.infer<typeof districtSchema>;
