import mongoose, { Schema, Document } from "mongoose";

export interface INotificationHistory extends Document {
  userId: Schema.Types.ObjectId;
  jobId?: Schema.Types.ObjectId;
  sprintId?: Schema.Types.ObjectId;
  assignmentId?: Schema.Types.ObjectId;
  messageId?: Schema.Types.ObjectId;
  title: string;
  body: string;
  type: "job_posted" | "assignment" | "message" | "deadline" | "announcement" | "sprint_created" | "virtual_session";
  virtualSessionId?: Schema.Types.ObjectId;
  fcmMessageId?: string; // FCM message ID for tracking
  read: boolean;
  readAt?: Date;
  clicked: boolean;
  clickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationHistorySchema: Schema<INotificationHistory> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: "JobSprint",
      index: true,
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      index: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["job_posted", "assignment", "message", "deadline", "announcement", "sprint_created", "virtual_session"],
      required: true,
      index: true,
    },
    virtualSessionId: {
      type: Schema.Types.ObjectId,
      ref: "VirtualSession",
      index: true,
    },
    fcmMessageId: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
    clickedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
NotificationHistorySchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationHistorySchema.index({ userId: 1, type: 1, createdAt: -1 });

const NotificationHistoryModel = mongoose.model<INotificationHistory>(
  "NotificationHistory",
  NotificationHistorySchema
);
export default NotificationHistoryModel;
