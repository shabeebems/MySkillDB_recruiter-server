import mongoose, { Schema, Document } from "mongoose";

export interface IAdminScript extends Document {
  organizationId: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  scriptType: "job_overview" | "content";
  jobId?: Schema.Types.ObjectId;
  title: string;
  selectedLength: string;
  userIdea?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminScriptSchema: Schema<IAdminScript> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    scriptType: {
      type: String,
      enum: ["job_overview", "content"],
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    selectedLength: {
      type: String,
      required: true,
      trim: true,
    },
    userIdea: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

AdminScriptSchema.index({ organizationId: 1 });
const AdminScriptModel = mongoose.model<IAdminScript>("AdminScript", AdminScriptSchema);
export default AdminScriptModel;
