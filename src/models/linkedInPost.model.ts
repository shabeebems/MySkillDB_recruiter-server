import mongoose, { Schema, Document } from "mongoose";

export interface ILinkedInPost extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  skillId: Schema.Types.ObjectId; // Changed from topicId to skillId for job-related LinkedIn posts
  topic: string;
  postText: string;
  userTopic: string;
  userContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInPostSchema: Schema<ILinkedInPost> = new Schema(
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
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    postText: {
      type: String,
      required: true,
    },
    userTopic: {
      type: String,
      required: true,
      trim: true,
    },
    userContext: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
LinkedInPostSchema.index({ userId: 1, skillId: 1 });
LinkedInPostSchema.index({ jobId: 1, skillId: 1 });

const LinkedInPostModel = mongoose.model<ILinkedInPost>(
  "LinkedInPost",
  LinkedInPostSchema
);

export default LinkedInPostModel;

