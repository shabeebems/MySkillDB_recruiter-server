import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  name: string;
  description?: string;
  companyName: string;
  companyId: Schema.Types.ObjectId;
  departmentIds: Schema.Types.ObjectId[]; // Primary field
  place: string;
  salaryRange?: string;
  requirements?: string[];
  organizationId: Schema.Types.ObjectId;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    companyName: { type: String, required: true, trim: true },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    departmentIds: [{
      type: Schema.Types.ObjectId,
      ref: "Department",
    }],
    place: { type: String, required: true, trim: true },
    salaryRange: { type: String, trim: true },
    requirements: [{ type: String, trim: true }],
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add index for better query performance
JobSchema.index({ organizationId: 1 });
JobSchema.index({ departmentIds: 1 });
JobSchema.index({ companyId: 1 });

const JobModel = mongoose.model<IJob>("Job", JobSchema);
export default JobModel;
