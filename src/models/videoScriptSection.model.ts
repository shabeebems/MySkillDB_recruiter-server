import mongoose, { Schema, Document } from "mongoose";

export interface IVideoScriptSection extends Document {
  videoScriptId: Schema.Types.ObjectId;
  time: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoScriptSectionSchema: Schema<IVideoScriptSection> = new Schema(
  {
    videoScriptId: {
      type: Schema.Types.ObjectId,
      ref: "VideoScript",
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for better query performance
VideoScriptSectionSchema.index({ videoScriptId: 1, order: 1 });

const VideoScriptSectionModel = mongoose.model<IVideoScriptSection>(
  "VideoScriptSection",
  VideoScriptSectionSchema
);

export default VideoScriptSectionModel;

