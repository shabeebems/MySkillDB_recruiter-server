import { Schema, model, Document } from "mongoose";

export interface ICountry extends Document {
  country: string;
  countryCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const countrySchema = new Schema<ICountry>(
  {
    country: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true, uppercase: true },
  },
  { timestamps: true, collection: "countries" }
);

countrySchema.index({ countryCode: 1 }, { unique: true });

export default model<ICountry>("Country", countrySchema);
