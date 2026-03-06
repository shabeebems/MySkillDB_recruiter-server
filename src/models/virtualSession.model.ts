import mongoose, { Schema, Document } from "mongoose";

export interface IVirtualSession extends Document {
  name: string;
  meetLink?: string;
  date: string;
  time: string;
  sessionType: "academic" | "job";
  organizationId: Schema.Types.ObjectId;
  isRecurring?: boolean;
  frequency?: "daily" | "weekly" | "bi-weekly" | "monthly";
  /** Session start computed from date+time (used for sorting/upcoming queries). */
  startsAt?: Date;
  /** Set for non-recurring sessions only: session end (date+time) + 1 hour. MongoDB TTL deletes the doc when this time has passed. */
  expiresAt?: Date;
  subjectId?: Schema.Types.ObjectId;
  jobId?: Schema.Types.ObjectId;
  skillIds?: string[];
  inviteeUserIds: Schema.Types.ObjectId[];
  inviteeEmails?: string[];
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VirtualSessionSchema: Schema<IVirtualSession> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    meetLink: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ["academic", "job"],
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "bi-weekly", "monthly"],
    },
    startsAt: {
      type: Date,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },
    skillIds: {
      type: [String],
      default: [],
    },
    inviteeUserIds: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      default: [],
    },
    inviteeEmails: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

VirtualSessionSchema.index({ organizationId: 1, createdAt: -1 });
VirtualSessionSchema.index({ inviteeUserIds: 1 });
VirtualSessionSchema.index({ organizationId: 1, startsAt: 1 });
// TTL: delete document when expiresAt has passed (used for non-recurring sessions only)
VirtualSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VirtualSessionModel = mongoose.model<IVirtualSession>(
  "VirtualSession",
  VirtualSessionSchema
);
export default VirtualSessionModel;
