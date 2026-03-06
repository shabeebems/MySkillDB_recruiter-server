import { Schema, model, Document } from "mongoose";

export interface IState extends Document {
  state: string;
  stateCode: string;
  countryCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const stateSchema = new Schema<IState>(
  {
    state: { type: String, required: true, unique: true },
    stateCode: { type: String, required: true, uppercase: true },
    countryCode: { type: String, required: true, uppercase: true, ref: "Country" },
  },
  { timestamps: true, collection: "states" }
);

stateSchema.index({ stateCode: 1 }, { unique: true });

export default model<IState>("State", stateSchema);
