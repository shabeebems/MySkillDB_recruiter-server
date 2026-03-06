import { Schema, model, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  board: string;
  establishedYear: number;
  adminName: string;
  adminEmail: string;
  mobileNumber: string;
  alternateEmail?: string;
  address: string;
  country: string;
  state: string;
  district: string;
  pincode: string;
  totalStudents: number;
  totalTeachers: number;
  principalName: string;
  premiumType: "Lite" | "Managed" | "Premium";
  status: "pending" | "active" | "rejected" | "inactive";
  isSetupCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    board: { type: String, required: true, trim: true },
    establishedYear: { type: Number, required: true },
    adminName: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, unique: true, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    alternateEmail: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    totalStudents: { type: Number, required: true },
    totalTeachers: { type: Number, required: true },
    principalName: { type: String, required: true, trim: true },
    premiumType: {
      type: String,
      enum: ["Lite", "Managed", "Premium"],
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "inactive"],
      default: "pending",
      required: true,
      trim: true,
    },
    isSetupCompleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true, collection: "organizations" }
);

export default model<IOrganization>("Organization", organizationSchema);
