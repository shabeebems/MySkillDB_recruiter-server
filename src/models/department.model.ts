import { Schema, model, Document, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  organizationId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true, collection: "departments" }
);

export default model<IDepartment>("Department", departmentSchema);
