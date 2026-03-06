import mongoose, { Schema, Document } from "mongoose";

export interface IFCMToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  deviceInfo: {
    userAgent?: string;
    platform?: string;
    browser?: string;
  };
  platform: "web" | "ios" | "android";
  createdAt: Date;
  updatedAt: Date;
}

const FCMTokenSchema: Schema<IFCMToken> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    deviceInfo: {
      userAgent: { type: String, trim: true },
      platform: { type: String, trim: true },
      browser: { type: String, trim: true },
    },
    platform: {
      type: String,
      enum: ["web", "ios", "android"],
      default: "web",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for faster lookups
FCMTokenSchema.index({ userId: 1, token: 1 });

const FCMTokenModel = mongoose.model<IFCMToken>("FCMToken", FCMTokenSchema);
export default FCMTokenModel;
