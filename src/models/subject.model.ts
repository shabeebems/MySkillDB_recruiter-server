import { Schema, model, Document, Types } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code?: string;
  description?: string;
  organizationId: Types.ObjectId; // reference to Organization
  departmentId: Types.ObjectId;   // reference to Department
  createdAt?: Date;
  updatedAt?: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true, collection: "subjects" }
);

export default model<ISubject>("Subject", subjectSchema);
