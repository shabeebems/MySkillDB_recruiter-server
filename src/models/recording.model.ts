import mongoose, { Schema, Document } from "mongoose";

export interface IRecording extends Document {
  name: string;
  link: string;
  description?: string;
  duration: string;
  type: "job" | "subject";
  subId?: Schema.Types.ObjectId;
  topicId?: Schema.Types.ObjectId;
  jobId?: Schema.Types.ObjectId;
  skillId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecordingSchema: Schema<IRecording> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["job", "subject"],
      required: true,
    },
    subId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: false,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
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
  },
  { timestamps: true }
);

const RecordingModel = mongoose.model<IRecording>("Recording", RecordingSchema);
export default RecordingModel;
