import { Schema, model, Document, Types } from "mongoose";

export interface ISection extends Document {
  name: string;
  description?: string;
  organizationId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true, collection: "sections" }
);

export default model<ISection>("Section", sectionSchema);
