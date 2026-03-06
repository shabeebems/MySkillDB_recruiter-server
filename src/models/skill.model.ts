import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  description?: string;
  type: "technical" | "tools" | "soft" | "other";
  jobId: Schema.Types.ObjectId; // Required - skills are always associated with jobs
  organizationId: Schema.Types.ObjectId;
  departmentId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema<ISkill> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["technical", "tools", "soft", "other"],
      required: true,
      default: "technical",
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

// Index for efficient queries
SkillSchema.index({ jobId: 1 });
SkillSchema.index({ jobId: 1, type: 1 });
SkillSchema.index({ organizationId: 1 });

const SkillModel = mongoose.model<ISkill>("Skill", SkillSchema);
export default SkillModel;

