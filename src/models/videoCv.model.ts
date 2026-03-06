import mongoose, { Schema, Document } from "mongoose";

/**
 * Video CV Interface
 * Stores video CV links for students against specific jobs.
 */
export interface IVideoCv extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Video CV Schema
 * Stores video CV links submitted by students for specific jobs.
 * One document per user per job (enforced by unique index).
 */
const VideoCvSchema: Schema<IVideoCv> = new Schema(
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
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one document per user + job combination
VideoCvSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Performance indexes
VideoCvSchema.index({ userId: 1 });
VideoCvSchema.index({ jobId: 1 });

const VideoCvModel = mongoose.model<IVideoCv>("VideoCv", VideoCvSchema);

export default VideoCvModel;

