import mongoose, { Schema, Document } from "mongoose";

export interface IAdminScriptSection extends Document {
  adminScriptId: Schema.Types.ObjectId;
  time: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdminScriptSectionSchema: Schema<IAdminScriptSection> = new Schema(
  {
    adminScriptId: {
      type: Schema.Types.ObjectId,
      ref: "AdminScript",
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

AdminScriptSectionSchema.index({ adminScriptId: 1 });
const AdminScriptSectionModel = mongoose.model<IAdminScriptSection>(
  "AdminScriptSection",
  AdminScriptSectionSchema
);
export default AdminScriptSectionModel;
