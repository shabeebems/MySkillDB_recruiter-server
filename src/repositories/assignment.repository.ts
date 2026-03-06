import { Types } from "mongoose";
import assignmentModel, { IAssignment } from "../models/assignment.model";
import { BaseRepository } from "./base.repository";

export class AssignmentRepository extends BaseRepository<IAssignment> {
  constructor() {
    super(assignmentModel);
  }

  async insertMany(data: Partial<IAssignment>[]): Promise<IAssignment[]> {
    return this.model.insertMany(data) as unknown as IAssignment[];
  }

  async findWithFilter(
    organizationId: string,
    filters?: { departmentId?: string; classId?: string }
  ): Promise<IAssignment[]> {
    const query: any = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (filters?.departmentId) {
      query.departmentId = new Types.ObjectId(filters.departmentId);
    }

    if (filters?.classId) {
      query.classId = new Types.ObjectId(filters.classId);
    }

    return this.model
      .find(query)
      .populate("sectionId", "name")
      .exec();
  }

  async findUniqueClassesByDepartment(
    organizationId: string,
    departmentId: string
  ): Promise<{ _id: Types.ObjectId; name: string }[]> {
    const result = await this.model.aggregate([
      {
        $match: {
          organizationId: new Types.ObjectId(organizationId),
          departmentId: new Types.ObjectId(departmentId),
        },
      },
      {
        $lookup: {
          from: "classes", // your actual collection name for classes
          localField: "classId",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $group: {
          _id: "$class._id",
          name: { $first: "$class.name" },
        },
      },
    ]);

    return result;
  }

  async findUniqueSectionsByDepartmentAndClass(
    organizationId: string,
    departmentId: string,
    classId: string
  ): Promise<
    {
      _id: Types.ObjectId;
      assignmentId: Types.ObjectId;
      name: string /* other fields */;
    }[]
  > {
    const result = await this.model.aggregate([
      {
        $match: {
          organizationId: new Types.ObjectId(organizationId),
          departmentId: new Types.ObjectId(departmentId),
          classId: new Types.ObjectId(classId),
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "sectionId",
          foreignField: "_id",
          as: "section",
        },
      },
      { $unwind: "$section" },
      {
        $group: {
          _id: "$section._id",
          name: { $first: "$section.name" },
          assignmentId: { $first: "$_id" }, // The assignment document ID
          // Add other fields from the assignment document if needed
          // assignmentField: { $first: "$someField" },
          // Add other fields from the section document if needed
          // sectionField: { $first: "$section.someField" },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return result;
  }

  async findByIdWithPopulate(id: string): Promise<IAssignment | null> {
    return this.model
      .findById(id)
      .populate("classId", "name")
      .populate("sectionId", "name")
      .populate("departmentId", "name")
      .exec();
  }

  async findByIdsWithPopulate(ids: string[]): Promise<IAssignment[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return this.model
      .find({ _id: { $in: objectIds } })
      .populate("classId", "name")
      .populate("sectionId", "name")
      .populate("departmentId", "name")
      .exec();
  }
}
