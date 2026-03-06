import mongoose, { Schema, Document } from "mongoose";

export interface ICVProfile extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  address: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  aboutMe: string;
  emailIcon?: string;
  phoneIcon?: string;
  addressIcon?: string;
  emailIconColor?: string;
  phoneIconColor?: string;
  addressIconColor?: string;
  linkedinIconColor?: string;
  githubIconColor?: string;
  portfolioIconColor?: string;
  sectionOrder?: string[];
  skills?: string[];
  customSections?: Array<{
    id: string;
    name: string;
    entries: Array<{
      id: string;
      title: string;
      subtitle?: string;
      description?: string;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CVProfileSchema: Schema<ICVProfile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    aboutMe: { type: String, required: true, trim: true },
    emailIcon: { type: String, trim: true },
    phoneIcon: { type: String, trim: true },
    addressIcon: { type: String, trim: true },
    emailIconColor: { type: String, trim: true },
    phoneIconColor: { type: String, trim: true },
    addressIconColor: { type: String, trim: true },
    linkedinIconColor: { type: String, trim: true },
    githubIconColor: { type: String, trim: true },
    portfolioIconColor: { type: String, trim: true },
    sectionOrder: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    customSections: {
      type: [{
        id: String,
        name: String,
        entries: [{
          id: String,
          title: String,
          subtitle: String,
          description: String,
        }],
      }],
      default: [],
    },
  },
  { timestamps: true }
);

const CVProfileModel = mongoose.model<ICVProfile>("CVProfile", CVProfileSchema);
export default CVProfileModel;

