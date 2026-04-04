import { IJob } from "../models/job.model";

export const formatJobsOutput = (jobs: IJob[] | null) => {
  if (!jobs) return [];
  return jobs.map((job) => ({
    _id: job._id,
    name: job.name,
    companyName: job.companyName,
    companyId: job.companyId,
    place: job.place,
    description: job.description,
    requirements: job.requirements,
    salaryRange: job.salaryRange,
    departmentIds: job.departmentIds,
    isActive: job.isActive !== undefined ? job.isActive : true, // Default to true if undefined
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    createdByStudentId: job.createdByStudentId
      ? String(job.createdByStudentId)
      : null,
  }));
};