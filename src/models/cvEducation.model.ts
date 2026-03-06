import mongoose, { Schema, Document } from "mongoose";

export interface ICVEducation extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CVEducationSchema: Schema<ICVEducation> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startYear: { type: String, required: true, trim: true },
    endYear: { type: String, required: true, trim: true },
    gpa: { type: String, trim: true },
  },
  { timestamps: true }
);

const CVEducationModel = mongoose.model<ICVEducation>("CVEducation", CVEducationSchema);
export default CVEducationModel;

