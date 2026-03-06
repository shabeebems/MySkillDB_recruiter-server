import mongoose, { Schema, Document } from "mongoose";

export interface ICvStylePreference extends Document {
  userId: Schema.Types.ObjectId;
  // Name (e.g. CV title/name)
  nameFontFamily?: string;
  nameFontWeight?: string;
  nameFontSize?: string;
  nameColor?: string;
  // Headings (section titles)
  headingFontFamily?: string;
  headingFontWeight?: string;
  headingFontSize?: string;
  headingColor?: string;
  headingLineHeight?: string;
  headingLetterSpacing?: string;
  // Summary (professional summary block)
  summaryFontFamily?: string;
  summaryFontWeight?: string;
  summaryFontSize?: string;
  summaryColor?: string;
  summaryLineHeight?: string;
  summaryLetterSpacing?: string;
  // Body (paragraphs, list items)
  bodyFontFamily?: string;
  bodyFontWeight?: string;
  bodyFontSize?: string;
  bodyColor?: string;
  bodyLineHeight?: string;
  bodyLetterSpacing?: string;
  elementStyles?: Record<string, { fontFamily?: string; fontWeight?: string; fontSize?: string; color?: string; lineHeight?: string; letterSpacing?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const CvStylePreferenceSchema: Schema<ICvStylePreference> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nameFontFamily: { type: String, trim: true },
    nameFontWeight: { type: String, trim: true },
    nameFontSize: { type: String, trim: true },
    nameColor: { type: String, trim: true },
    headingFontFamily: { type: String, trim: true },
    headingFontWeight: { type: String, trim: true },
    headingFontSize: { type: String, trim: true },
    headingColor: { type: String, trim: true },
    headingLineHeight: { type: String, trim: true },
    headingLetterSpacing: { type: String, trim: true },
    summaryFontFamily: { type: String, trim: true },
    summaryFontWeight: { type: String, trim: true },
    summaryFontSize: { type: String, trim: true },
    summaryColor: { type: String, trim: true },
    summaryLineHeight: { type: String, trim: true },
    summaryLetterSpacing: { type: String, trim: true },
    bodyFontFamily: { type: String, trim: true },
    bodyFontWeight: { type: String, trim: true },
    bodyFontSize: { type: String, trim: true },
    bodyColor: { type: String, trim: true },
    bodyLineHeight: { type: String, trim: true },
    bodyLetterSpacing: { type: String, trim: true },
    elementStyles: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const CvStylePreferenceModel = mongoose.model<ICvStylePreference>(
  "CvStylePreference",
  CvStylePreferenceSchema
);
export default CvStylePreferenceModel;
