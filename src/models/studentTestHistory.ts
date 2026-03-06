import mongoose, { Schema, Document } from "mongoose";

export interface IStudentTest extends Document {
  userId: Schema.Types.ObjectId;
  testId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  status: "Completed" | "Pending";
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentTestSchema: Schema<IStudentTest> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: Schema.Types.ObjectId, ref: "Test", required: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Pending",
    },
    score: { type: Number },
    totalQuestions: { type: Number },
    correctAnswers: { type: Number },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const StudentTestModel = mongoose.model<IStudentTest>(
  "StudentTest",
  StudentTestSchema
);

export default StudentTestModel;
