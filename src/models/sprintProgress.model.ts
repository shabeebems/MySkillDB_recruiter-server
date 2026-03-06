import mongoose, { Schema, Document } from "mongoose";

export interface ISprintProgress extends Document {
  userId: Schema.Types.ObjectId;
  sprintId: Schema.Types.ObjectId;
  departmentId?: Schema.Types.ObjectId;
  assignmentId?: Schema.Types.ObjectId;
  status: "not_started" | "in_progress" | "completed";
  completedJobsCount: number;
  totalJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

const SprintProgressSchema: Schema<ISprintProgress> = new Schema(
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
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      required: true,
    },
    completedJobsCount: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    totalJobs: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SprintProgressSchema.index({ userId: 1, sprintId: 1 }, { unique: true });
SprintProgressSchema.index({ sprintId: 1 });
SprintProgressSchema.index({ userId: 1 });
SprintProgressSchema.index({ status: 1 });

const SprintProgressModel = mongoose.model<ISprintProgress>(
  "SprintProgress",
  SprintProgressSchema
);

export default SprintProgressModel;

