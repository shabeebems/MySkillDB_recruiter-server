import { z } from "zod";

const optionalString = z.string().trim().optional();

const elementStyleSchema = z.object({
  fontFamily: optionalString,
  fontWeight: optionalString,
  fontSize: optionalString,
  color: optionalString,
  lineHeight: optionalString,
  letterSpacing: optionalString,
});

export const createOrUpdateCvStylePreferenceSchema = z.object({
  nameFontFamily: optionalString,
  nameFontWeight: optionalString,
  nameFontSize: optionalString,
  nameColor: optionalString,
  headingFontFamily: optionalString,
  headingFontWeight: optionalString,
  headingFontSize: optionalString,
  headingColor: optionalString,
  headingLineHeight: optionalString,
  headingLetterSpacing: optionalString,
  summaryFontFamily: optionalString,
  summaryFontWeight: optionalString,
  summaryFontSize: optionalString,
  summaryColor: optionalString,
  summaryLineHeight: optionalString,
  summaryLetterSpacing: optionalString,
  bodyFontFamily: optionalString,
  bodyFontWeight: optionalString,
  bodyFontSize: optionalString,
  bodyColor: optionalString,
  bodyLineHeight: optionalString,
  bodyLetterSpacing: optionalString,
  elementStyles: z.record(z.string(), elementStyleSchema).optional(),
});

export type CreateOrUpdateCvStylePreferenceInput = z.infer<
  typeof createOrUpdateCvStylePreferenceSchema
>;
