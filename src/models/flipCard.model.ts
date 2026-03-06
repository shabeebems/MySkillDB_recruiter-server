import mongoose, { Schema, Document } from "mongoose";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("flipCardmodel");


export interface IFlipCard extends Document {
  organizationId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  skillId: Schema.Types.ObjectId;
  heading: string;
  content: string;
  keypoints: string[];
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlipCardSchema: Schema<IFlipCard> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    keypoints: {
      type: [String],
      default: [],
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [{ type: String, required: true, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Indexes for efficient queries
// Note: No unique constraints - multiple flip cards allowed per skill/job combination
FlipCardSchema.index({ organizationId: 1 });
FlipCardSchema.index({ jobId: 1 });
FlipCardSchema.index({ skillId: 1 });
FlipCardSchema.index({ organizationId: 1, jobId: 1, skillId: 1 });

const FlipCardModel = mongoose.model<IFlipCard>("FlipCard", FlipCardSchema);

/**
 * Ensures no unique index exists on skillId + jobId
 * This allows multiple flip cards per skill/job combination
 * Should be called after database connection is established
 */
export async function ensureNoUniqueIndexOnFlipCards() {
  try {
    const collection = FlipCardModel.collection;
    const indexes = await collection.indexes();
    
    // Find unique index on skillId + jobId
    const uniqueIndex = indexes.find(
      (idx: any) => 
        (idx.name === 'skillId_1_jobId_1' || 
         (idx.key?.skillId === 1 && idx.key?.jobId === 1 && idx.unique === true))
    );
    
    if (uniqueIndex && uniqueIndex.name) {
      await collection.dropIndex(uniqueIndex.name);
      log.info(`✅ Dropped unique index: ${uniqueIndex.name} from flipcards collection`);
    }
  } catch (error: any) {
    // Silently handle - index might not exist or already dropped
    if (error.code !== 27) { // 27 = IndexNotFound
      log.warn('Note: Could not verify/drop unique index on flipcards:', error.message);
    }
  }
}

export default FlipCardModel;

