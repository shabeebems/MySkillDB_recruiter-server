import mongoose, { Schema, Document } from "mongoose";

export interface IKeyConcept {
  title: string;
  content: string;
}

export interface IJobBriefSection {
  heading: string;
  icon: string;
  content: string;
}

export interface IReadingModule extends Document {
  jobId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  skillId?: Schema.Types.ObjectId; // Optional for job-brief type
  skillName?: string;
  jobContext?: string;
  introduction?: string;
  keyConcepts?: IKeyConcept[];
  practicalExample?: string;
  summary?: string[];
  // Job Brief fields
  moduleType: "skill-module" | "job-brief";
  title?: string;
  sections?: IJobBriefSection[];
  metadata?: {
    wordCount?: number;
    readingTimeMinutes?: number;
    targetAudience?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReadingModuleSchema: Schema<IReadingModule> = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: false,
    },
    skillName: {
      type: String,
      required: false,
      trim: true,
    },
    jobContext: {
      type: String,
      required: false,
      trim: true,
    },
    introduction: {
      type: String,
      required: false,
    },
    keyConcepts: [
      {
        title: {
          type: String,
          trim: true,
        },
        content: {
          type: String,
        },
      },
    ],
    practicalExample: {
      type: String,
      required: false,
    },
    summary: [
      {
        type: String,
      },
    ],
    // Job Brief fields
    moduleType: {
      type: String,
      enum: ["skill-module", "job-brief"],
      default: "skill-module",
    },
    title: {
      type: String,
      trim: true,
    },
    sections: [
      {
        heading: { type: String, trim: true },
        icon: { type: String, trim: true },
        content: { type: String },
      },
    ],
    metadata: {
      wordCount: { type: Number },
      readingTimeMinutes: { type: Number },
      targetAudience: { type: String },
    },
  },
  { timestamps: true }
);

// Index for better query performance
ReadingModuleSchema.index({ jobId: 1, skillId: 1 });
ReadingModuleSchema.index({ jobId: 1, moduleType: 1 });
ReadingModuleSchema.index({ organizationId: 1, moduleType: 1 });

const ReadingModuleModel = mongoose.model<IReadingModule>(
  "ReadingModule",
  ReadingModuleSchema
);

export default ReadingModuleModel;

