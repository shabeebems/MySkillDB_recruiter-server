import mongoose, { Schema, Document } from "mongoose";

export interface IVideoScript extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  skillId: Schema.Types.ObjectId; // Changed from topicId to skillId for job-related video scripts
  userIdea: string;
  selectedLength: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoScriptSchema: Schema<IVideoScript> = new Schema(
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
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    userIdea: {
      type: String,
      required: true,
      trim: true,
    },
    selectedLength: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
VideoScriptSchema.index({ jobId: 1, skillId: 1 });
VideoScriptSchema.index({ userId: 1, skillId: 1 });

const VideoScriptModel = mongoose.model<IVideoScript>(
  "VideoScript",
  VideoScriptSchema
);

export default VideoScriptModel;

