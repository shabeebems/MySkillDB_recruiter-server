import { ISkill } from "../models/skill.model";

export const formatSkillsOutput = (skills: ISkill[] | null) => {
  if (!skills) return [];
  return skills.map((skill) => ({
    _id: skill._id,
    name: skill.name,
    description: skill.description,
    type: skill.type,
    jobId: (skill as any).jobId?._id || skill.jobId, // handles populated or raw ID
    job: (skill as any).jobId?.name || null, // populated job name
    departmentId: (skill as any).departmentId?._id || skill.departmentId,
    department: (skill as any).departmentId?.name || null, // populated department name
    organizationId: skill.organizationId,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }));
};

