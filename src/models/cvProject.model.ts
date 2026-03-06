import mongoose, { Schema, Document } from "mongoose";

export interface ICVProject extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CVProjectSchema: Schema<ICVProject> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    startDate: { type: String, required: false, trim: true, default: "" },
    endDate: { type: String, required: false, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const CVProjectModel = mongoose.model<ICVProject>("CVProject", CVProjectSchema);
export default CVProjectModel;

