import { Schema, model, Document, Types } from "mongoose";

export interface IClass extends Document {
  name: string;
  description?: string;
  organizationId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true, collection: "classes" }
);

export default model<IClass>("Class", classSchema);
