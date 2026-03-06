import mongoose, { Schema, Document } from "mongoose";

export type OrganizationActivityType =
  | "job_posted"
  | "video_cv_submitted"
  | "sprint_completed"
  | "student_registered";

export interface IOrganizationActivity extends Document {
  organizationId: Schema.Types.ObjectId;
  type: OrganizationActivityType;
  title: string;
  message: string;
  metadata?: Record<string, string>;
  readBy: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}


const OrganizationActivitySchema: Schema<IOrganizationActivity> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["job_posted", "video_cv_submitted", "sprint_completed", "student_registered"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

OrganizationActivitySchema.index({ organizationId: 1, createdAt: -1 });
OrganizationActivitySchema.index({ organizationId: 1, type: 1, createdAt: -1 });

const OrganizationActivityModel = mongoose.model<IOrganizationActivity>(
  "OrganizationActivity",
  OrganizationActivitySchema
);
export default OrganizationActivityModel;
