import mongoose, { Schema, Document } from "mongoose";

export interface INotificationQueue extends Document {
  userId: Schema.Types.ObjectId;
  type: "job_posted" | "assignment" | "message" | "deadline" | "announcement" | "virtual_session";
  priority: "high" | "medium" | "low";
  data: {
    jobId?: Schema.Types.ObjectId;
    sprintId?: Schema.Types.ObjectId;
    virtualSessionId?: Schema.Types.ObjectId;
    assignmentId?: Schema.Types.ObjectId;
    messageId?: Schema.Types.ObjectId;
    title?: string;
    body?: string;
    url?: string;
    [key: string]: any;
  };
  status: "pending" | "sent" | "failed";
  scheduledAt: Date;
  sentAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationQueueSchema: Schema<INotificationQueue> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["job_posted", "assignment", "message", "deadline", "announcement", "virtual_session"],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
NotificationQueueSchema.index({ status: 1, scheduledAt: 1 });
NotificationQueueSchema.index({ userId: 1, status: 1, type: 1 });
NotificationQueueSchema.index({ status: 1, priority: 1, scheduledAt: 1 });

const NotificationQueueModel = mongoose.model<INotificationQueue>(
  "NotificationQueue",
  NotificationQueueSchema
);
export default NotificationQueueModel;
