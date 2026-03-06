import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  questionText: string;
  options: string[];
  correctAnswer: string;
  testId?: Schema.Types.ObjectId;
  topicId?: Schema.Types.ObjectId; // For subject topics
  skillId?: Schema.Types.ObjectId; // For job skills
  difficultyLevel: "Easy" | "Medium" | "Hard";
  organizationId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
    testId: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: false,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: false,
    },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

const QuestionModel = mongoose.model<IQuestion>("Question", QuestionSchema);
export default QuestionModel;
