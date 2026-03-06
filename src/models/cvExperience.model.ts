import mongoose, { Schema, Document } from "mongoose";

export interface ICVExperience extends Document {
  userId: Schema.Types.ObjectId;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CVExperienceSchema: Schema<ICVExperience> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, trim: true },
    isCurrent: { type: Boolean, required: true, default: false },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const CVExperienceModel = mongoose.model<ICVExperience>("CVExperience", CVExperienceSchema);
export default CVExperienceModel;

