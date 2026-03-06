import mongoose, { Schema, Document } from "mongoose";

export interface IJobFlipCardResult extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  totalFlipCards: number;
  attendedTimes: number;
  correctCount: number;
  incorrectCount: number;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobFlipCardResultSchema: Schema<IJobFlipCardResult> = new Schema(
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
    totalFlipCards: {
      type: Number,
      min: 0,
      required: true,
    },
    attendedTimes: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    correctCount: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    incorrectCount: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

JobFlipCardResultSchema.index({ userId: 1, jobId: 1 }, { unique: true });
JobFlipCardResultSchema.index({ userId: 1 });
JobFlipCardResultSchema.index({ jobId: 1 });

const JobFlipCardResult = mongoose.model<IJobFlipCardResult>(
  "JobFlipCardResult",
  JobFlipCardResultSchema
);

export default JobFlipCardResult;

