import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  email?: string;
  mobile?: string;
  designation?: "mentor" | "founder" | "hr" ;
  organization?: string;
  linkedin?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },
    designation: { type: String, trim: true },
    organization: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

const ContactModel = mongoose.model<IContact>("Contact", ContactSchema);
export default ContactModel;