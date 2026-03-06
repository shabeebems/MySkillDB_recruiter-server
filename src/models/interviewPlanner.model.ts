import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewPlanner extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewPlannerSchema: Schema<IInterviewPlanner> = new Schema(
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
  },
  { timestamps: true }
);

InterviewPlannerSchema.index({ userId: 1, jobId: 1 });

const InterviewPlannerModel = mongoose.model<IInterviewPlanner>(
  "InterviewPlanner",
  InterviewPlannerSchema,
  "interviewplanners"
);

export default InterviewPlannerModel;
