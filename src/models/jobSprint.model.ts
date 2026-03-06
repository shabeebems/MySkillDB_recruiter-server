import mongoose, { Schema, Document } from "mongoose";

export interface IJobSprint extends Document {
  name: string;
  type: "department" | "class";
  depIds?: Schema.Types.ObjectId[];
  assignmentIds?: Schema.Types.ObjectId[];
  jobIds: Schema.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  organizationId: Schema.Types.ObjectId;
  completionPercentage?: number;
  totalStudents?: number;
  completedStudents?: number;
  status?: "not_started" | "in_progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const JobSprintSchema: Schema<IJobSprint> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["department", "class"],
      required: true,
    },
    depIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    assignmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    jobIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalStudents: {
      type: Number,
      min: 0,
      default: 0,
    },
    completedStudents: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
  },
  {
    timestamps: true,
  }
);

JobSprintSchema.index({ organizationId: 1 });
JobSprintSchema.index({ type: 1 });
JobSprintSchema.index({ depIds: 1 });
JobSprintSchema.index({ assignmentIds: 1 });
JobSprintSchema.index({ jobIds: 1 });
JobSprintSchema.index({ startDate: 1, endDate: 1 });
JobSprintSchema.index({ completionPercentage: 1 });
JobSprintSchema.index({ status: 1 });

const JobSprintModel = mongoose.model<IJobSprint>("JobSprint", JobSprintSchema);

export default JobSprintModel;
