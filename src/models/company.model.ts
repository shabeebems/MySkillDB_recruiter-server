import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema<ICompany> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    website: { type: String, trim: true },
    
  },
  { timestamps: true }
);

// Index for better query performance 
CompanySchema.index({ name: 1,  }, { unique: true });

const CompanyModel = mongoose.model<ICompany>("Company", CompanySchema);
export default CompanyModel;
