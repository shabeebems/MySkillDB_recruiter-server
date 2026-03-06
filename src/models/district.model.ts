import { Schema, model, Document } from "mongoose";

export interface IDistrict extends Document {
  district: string;
  districtCode: string;
  stateCode: string;
  countryCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const districtSchema = new Schema<IDistrict>(
  {
    district: { type: String, required: true, unique: true },
    districtCode: { type: String, required: true, unique: true, uppercase: true },
    stateCode: { type: String, required: true, uppercase: true, ref: "State" },
    countryCode: { type: String, required: true, uppercase: true, ref: "Country" },
  },
  { timestamps: true, collection: "districts" }
);

districtSchema.index({ stateCode: 1 });
districtSchema.index({ countryCode: 1 });

districtSchema.index({ countryCode: 1, stateCode: 1 });

export default model<IDistrict>("District", districtSchema);
