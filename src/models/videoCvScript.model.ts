import mongoose, { Schema, Document } from "mongoose";

export interface IVideoCvScript extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  userReasons?: string; // User's additional details/reasons for being a fit
  videoDuration: string; // '1-2', '2-3', etc.
  tips?: string[]; // AI-generated recording tips
  attempt: number; // Number of attempts (max 3, default 1)
  createdAt: Date;
  updatedAt: Date;
}

const VideoCvScriptSchema: Schema<IVideoCvScript> = new Schema(
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
    userReasons: {
      type: String,
      required: false,
      trim: true,
    },
    videoDuration: {
      type: String,
      required: true,
      enum: ['1-2', '2-3', '5-7', '8-10'],
      default: '1-2',
    },
    tips: {
      type: [String],
      required: false,
      default: [],
    },
    attempt: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
VideoCvScriptSchema.index({ userId: 1, jobId: 1 });
VideoCvScriptSchema.index({ jobId: 1 });
VideoCvScriptSchema.index({ userId: 1, createdAt: -1 }); // For recent scripts by user

const VideoCvScriptModel = mongoose.model<IVideoCvScript>(
  "VideoCvScript",
  VideoCvScriptSchema
);

export default VideoCvScriptModel;

