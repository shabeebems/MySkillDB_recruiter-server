import JobSprintModel, { IJobSprint } from "../models/jobSprint.model";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

export class JobSprintRepository extends BaseRepository<IJobSprint> {
  constructor() {
    super(JobSprintModel);
  }

  findByOrganizationId = (
    organizationId: string,
    skip: number = 0,
    limit: number = 6
  ): Promise<IJobSprint[]> => {
    return this.model
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  };

  getCountByOrganizationId = (organizationId: string): Promise<number> => {
    return this.model
      .countDocuments({ organizationId: new Types.ObjectId(organizationId) })
      .exec();
  };

  findByIdWithJobs = (sprintId: string): Promise<IJobSprint | null> => {
    return this.model
      .findById(sprintId)
      .populate({
        path: 'jobIds',
        select: 'name companyName salaryRange place description requirements',
      })
      .populate({
        path: 'depIds',
        select: 'name',
      })
      .populate({
        path: 'assignmentIds',
        populate: [
          { path: 'sectionId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .exec();
  };
}
