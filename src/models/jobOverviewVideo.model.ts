import mongoose, { Schema, Document } from "mongoose";

export interface IJobOverviewVideo extends Document {
  organizationId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  title: string;
  videoUrl: string;
  description?: string;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobOverviewVideoSchema: Schema<IJobOverviewVideo> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

JobOverviewVideoSchema.index({ organizationId: 1, jobId: 1 });
JobOverviewVideoSchema.index({ jobId: 1 });

const JobOverviewVideoModel = mongoose.model<IJobOverviewVideo>(
  "JobOverviewVideo",
  JobOverviewVideoSchema
);
export default JobOverviewVideoModel;
