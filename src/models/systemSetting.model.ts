import { Schema, model, Document } from "mongoose";

export interface ISystemSetting extends Document {
  systemCode: string;
  values: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    systemCode: { type: String, required: true, unique: true },
    values: { type: [String], required: true, default: [] },
  },
  { timestamps: true, collection: "systemSettings" }
);

// Removed duplicate index declaration

export default model<ISystemSetting>("SystemSetting", systemSettingSchema);
