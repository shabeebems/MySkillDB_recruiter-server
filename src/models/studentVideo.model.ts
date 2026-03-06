import mongoose, { Schema, Document } from "mongoose";

export interface IStudentVideo extends Document {
  userId: Schema.Types.ObjectId;
  jobId?: Schema.Types.ObjectId; // Optional - for job-related videos
  skillId?: Schema.Types.ObjectId; // Optional - for job-related videos
  title: string;
  link: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentVideoSchema: Schema<IStudentVideo> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: false,
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
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
StudentVideoSchema.index({ userId: 1, skillId: 1 });
StudentVideoSchema.index({ jobId: 1, skillId: 1 });

const StudentVideoModel = mongoose.model<IStudentVideo>(
  "StudentVideo",
  StudentVideoSchema
);

export default StudentVideoModel;

