import mongoose, { Schema, Document } from "mongoose";

export interface ITopic extends Document {
  name: string;
  description?: string;
  subjectId: Schema.Types.ObjectId; // Required - topics are always associated with subjects
  difficultyLevel: "Easy" | "Medium" | "Hard";
  organizationId: Schema.Types.ObjectId;
  departmentId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema<ITopic> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      default: "Medium",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    subjectId: { 
      type: Schema.Types.ObjectId, 
      ref: "Subject",
      required: true 
    },
  },
  { timestamps: true }
);


const TopicModel = mongoose.model<ITopic>("Topic", TopicSchema);
export default TopicModel;
