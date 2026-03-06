import mongoose, { Schema, Document } from "mongoose";

export interface ICVCertificate extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  issuer: string;
  year: string;
  createdAt: Date;
  updatedAt: Date;
}

const CVCertificateSchema: Schema<ICVCertificate> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const CVCertificateModel = mongoose.model<ICVCertificate>("CVCertificate", CVCertificateSchema);
export default CVCertificateModel;

