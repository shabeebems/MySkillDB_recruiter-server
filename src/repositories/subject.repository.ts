import subjectModel, { ISubject } from "../models/subject.model";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

interface PopulatedDepartment {
  _id: Types.ObjectId;
  name: string;
}

export class SubjectRepository extends BaseRepository<ISubject> {
  constructor() {
    super(subjectModel);
  }

  async findAllByOrganizationWithDepartment(
    organizationId: string
  ): Promise<any[]> {
    const subjects = await this.model
      .find({ organizationId })
      .populate<{ departmentId: PopulatedDepartment }>(
        "departmentId",
        "_id name"
      )
      .lean();
    return subjects;
  }
}
