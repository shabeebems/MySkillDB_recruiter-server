import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  skillId: Schema.Types.ObjectId; // Changed from topicId to skillId for job-related testimonials
  validatorName: string;
  validatorEmail: string;
  validatorRole: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema<ITestimonial> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    validatorName: {
      type: String,
      required: true,
      trim: true,
    },
    validatorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    validatorRole: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
TestimonialSchema.index({ userId: 1, skillId: 1 });
TestimonialSchema.index({ jobId: 1, skillId: 1 });

const TestimonialModel = mongoose.model<ITestimonial>(
  "Testimonial",
  TestimonialSchema
);

export default TestimonialModel;

