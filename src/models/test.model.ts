import mongoose, { Schema, Document } from "mongoose";

export interface ITest extends Document {
  name: string;
  description: string;
  subjectId?: Schema.Types.ObjectId; // For subject-level tests
  topicId?: Schema.Types.ObjectId; // For subject topic-level tests
  jobId?: Schema.Types.ObjectId; // For job-level tests
  skillId?: Schema.Types.ObjectId; // For job skill-level tests (replaces topicId for jobs)
  difficultyLevel: "Easy" | "Medium" | "Hard";
  organizationId: Schema.Types.ObjectId;
  // teacherId?: Schema.Types.ObjectId; // Optional: for teacher-created tests
  questionCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema: Schema<ITest> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: false,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: false,
    },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    
  },
  { timestamps: true }
);

// Unique constraint: Only one job-level test per job (jobId must be unique when skillId is null/undefined)
// This ensures only one job-level test exists per job
TestSchema.index(
  { jobId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { 
      jobId: { $exists: true, $ne: null },
      $or: [
        { skillId: { $exists: false } },
        { skillId: null }
      ]
    }
  }
);

// Unique constraint: Only one skill-level test per skill (skillId must be unique)
// This ensures only one skill-level test exists per skill
TestSchema.index(
  { skillId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { 
      skillId: { $exists: true, $ne: null }
    }
  }
);

const TestModel = mongoose.model<ITest>("Test", TestSchema);
export default TestModel;
