import teachingAssignment, {
  ITeachingAssignment,
} from "../models/teachingAssignment.model";
import { BaseRepository } from "./base.repository";

export class teachingAssignmentRepository extends BaseRepository<ITeachingAssignment> {
  constructor() {
    super(teachingAssignment);
  }

  // 🧩 Fetch teaching assignments by organizationId and assignmentId with full details
  findByOrgAndAssignment = (organizationId: string, assignmentId: string) => {
    return this.model
      .find({ organizationId, assignmentId })
      .populate({
        path: "subjectId",
        select: "name code",
      })
      .populate({
        path: "teacherId",
        select: "name",
      });
  };

  // 🔁 Update teacher for an existing subject, or create if not exists
  assignOrUpdateTeacher = async (
    assignmentId: string,
    organizationId: string,
    subjectId: string,
    teacherId: string
  ) => {
    // Use findOneAndUpdate with upsert to create or update
    return this.model.findOneAndUpdate(
      {
        organizationId,
        assignmentId,
        subjectId,
      },
      {
        organizationId,
        assignmentId,
        subjectId,
        teacherId,
      },
      {
        upsert: true,
        new: true,
      }
    );
  };

  // ❌ Remove a subject entry by assignmentId, organizationId, and subjectId
  removeSubjectFromAssignment = async (
    assignmentId: string,
    organizationId: string,
    subjectId: string
  ) => {
    return this.model.deleteOne({
      assignmentId,
      organizationId,
      subjectId,
    });
  };

  // 👨‍🏫 Find all teaching assignments for a specific teacher
  findByTeacherId = (organizationId: string, teacherId: string) => {
    return this.model
      .find({ organizationId, teacherId })
      .populate({
        path: "assignmentId",
        populate: [
          {
            path: "classId",
            select: "name",
          },
          {
            path: "departmentId",
            select: "name",
          },
          {
            path: "sectionId",
            select: "name",
          },
        ],
      })
      .populate({
        path: "subjectId",
        select: "name code",
      });
  };
}
