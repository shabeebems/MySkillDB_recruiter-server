import mongoose, { Schema, Document } from "mongoose";

export interface IJobApplication extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  status: "pending" | "submitted" | "reviewed" | "rejected" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema<IJobApplication> = new Schema(
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
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "reviewed", "rejected", "accepted"],
      default: "submitted",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one application per user + job combination
JobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Performance indexes
JobApplicationSchema.index({ userId: 1 });
JobApplicationSchema.index({ jobId: 1 });
JobApplicationSchema.index({ organizationId: 1 });
JobApplicationSchema.index({ status: 1 });
JobApplicationSchema.index({ createdAt: -1 });

const JobApplicationModel = mongoose.model<IJobApplication>(
  "JobApplication",
  JobApplicationSchema
);

export default JobApplicationModel;

