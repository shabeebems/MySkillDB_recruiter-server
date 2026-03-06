import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewBuddyMessage extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  /** Plain text; when question/options are present this holds the rest of the message (or full text for backward compat). */
  content: string;
  /** Question text when the message is a multiple-choice prompt (stored separately from content). */
  question?: string;
  /** Answer options when the message is a multiple-choice prompt. */
  options?: string[];
  createdAt: Date;
}

const InterviewBuddyMessageSchema = new Schema<IInterviewBuddyMessage>(
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
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    question: {
      type: String,
      required: false,
    },
    options: {
      type: [String],
      default: undefined,
    },
  },
  { timestamps: true }
);

InterviewBuddyMessageSchema.index({ userId: 1, jobId: 1, createdAt: 1 });

const InterviewBuddyMessageModel = mongoose.model<IInterviewBuddyMessage>(
  "InterviewBuddyMessage",
  InterviewBuddyMessageSchema
);
export default InterviewBuddyMessageModel;
