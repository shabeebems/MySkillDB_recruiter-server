import { Schema, model, Document, Types } from "mongoose";

export interface IAssignment extends Document {
  sectionId: Types.ObjectId;
  classId: Types.ObjectId;
  departmentId: Types.ObjectId;
  organizationId: Types.ObjectId; // ✅ added organizationId
  createdAt?: Date;
  updatedAt?: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true, // ✅ required for consistency
    },
  },
  { timestamps: true, collection: "assignments" }
);

export default model<IAssignment>("Assignment", assignmentSchema);
