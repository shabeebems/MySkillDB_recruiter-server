import mongoose, { Schema, Document } from "mongoose";

export interface IVideoCvScriptSection extends Document {
  videoCvScriptId: Schema.Types.ObjectId;
  timestamp: string; // e.g., "0:00-0:30"
  section: string; // Section title/name (e.g., "Introduction", "Background & Experience")
  script: string; // The actual script content for this section
  order: number; // Order of the section in the script
  createdAt: Date;
  updatedAt: Date;
}

const VideoCvScriptSectionSchema: Schema<IVideoCvScriptSection> = new Schema(
  {
    videoCvScriptId: {
      type: Schema.Types.ObjectId,
      ref: "VideoCvScript",
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    script: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
VideoCvScriptSectionSchema.index({ videoCvScriptId: 1, order: 1 }); // For ordered retrieval
VideoCvScriptSectionSchema.index({ videoCvScriptId: 1 }); // For all sections of a script

const VideoCvScriptSectionModel = mongoose.model<IVideoCvScriptSection>(
  "VideoCvScriptSection",
  VideoCvScriptSectionSchema
);

export default VideoCvScriptSectionModel;

