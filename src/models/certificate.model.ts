import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  skillId: Schema.Types.ObjectId; // Changed from topicId to skillId for job-related certificates
  title: string;
  link: string;
  storageProvider: "google drive" | "dropbox";
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema<ICertificate> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    storageProvider: {
      type: String,
      enum: ["google drive", "dropbox"],
      required: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
CertificateSchema.index({ userId: 1, skillId: 1 });
CertificateSchema.index({ jobId: 1, skillId: 1 });

const CertificateModel = mongoose.model<ICertificate>(
  "Certificate",
  CertificateSchema
);

export default CertificateModel;