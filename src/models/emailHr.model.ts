import mongoose, { Schema, Document } from "mongoose";

export interface IEmailHr extends Document {
  name: string;
  email: string;
  companyName: string;
  destination: string;
  jobId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailHrSchema: Schema<IEmailHr> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Performance indexes
EmailHrSchema.index({ organizationId: 1 });
EmailHrSchema.index({ jobId: 1 });
EmailHrSchema.index({ createdAt: -1 });
EmailHrSchema.index({ email: 1 });

const EmailHrModel = mongoose.model<IEmailHr>("EmailHr", EmailHrSchema);

export default EmailHrModel;

