import { Schema, model, Document, Types } from "mongoose";

export interface ITeachingAssignment extends Document {
  organizationId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  teacherId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const teachingAssignmentSchema = new Schema<ITeachingAssignment>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming teachers are stored in User model
      required: false,
    },
  },
  { timestamps: true, collection: "teaching_assignments" }
);

// ✅ Add compound indexes for faster queries
teachingAssignmentSchema.index({ organizationId: 1, assignmentId: 1 });
// Unique index: one subject per assignment (teacher can be assigned later)
teachingAssignmentSchema.index({ organizationId: 1, assignmentId: 1, subjectId: 1 }, { unique: true });

export default model<ITeachingAssignment>(
  "TeachingAssignment",
  teachingAssignmentSchema
);
