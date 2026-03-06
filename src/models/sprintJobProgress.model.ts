import mongoose, { Schema, Document } from "mongoose";

/**
 * Sprint Job Progress Interface
 * Tracks completion status of individual jobs within a sprint.
 * Each document represents one job's progress in one sprint.
 */
export interface ISprintJobProgress extends Document {
  userId: Schema.Types.ObjectId;
  sprintId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  status: "pending" | "completed";
  completedAt?: Date;
  flipCardProgress: number;
  assessmentProgress: number;
  videoCvStatus: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sprint Job Progress Schema
 * Tracks which jobs have been completed in a sprint.
 * Status: "pending" → "completed" when job is finished.
 * Tracks progress for flip cards and assessments (0-100%), and video CV status.
 * One document per job per sprint (enforced by unique index).
 */
const SprintJobProgressSchema: Schema<ISprintJobProgress> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: "JobSprint",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      required: true,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    flipCardProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      required: true,
    },
    assessmentProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      required: true,
    },
    videoCvStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one document per user + sprint + job combination
SprintJobProgressSchema.index(
  { userId: 1, sprintId: 1, jobId: 1 },
  { unique: true }
);

// Performance indexes
SprintJobProgressSchema.index({ userId: 1 });
SprintJobProgressSchema.index({ sprintId: 1 });
SprintJobProgressSchema.index({ jobId: 1 });
SprintJobProgressSchema.index({ status: 1 });
SprintJobProgressSchema.index({ completedAt: 1 });

const SprintJobProgressModel = mongoose.model<ISprintJobProgress>(
  "SprintJobProgress",
  SprintJobProgressSchema
);

export default SprintJobProgressModel;

