import mongoose, { Schema, Document } from "mongoose";

export interface IAdminVideo extends Document {
  organizationId: Schema.Types.ObjectId;
  title: string;
  videoUrl: string;
  description?: string;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminVideoSchema: Schema<IAdminVideo> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

AdminVideoSchema.index({ organizationId: 1 });

const AdminVideoModel = mongoose.model<IAdminVideo>("AdminVideo", AdminVideoSchema);
export default AdminVideoModel;
