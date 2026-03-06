import { ITopic } from "../models/topic.model";

export const formatTopicsOutput = (topics: ITopic[] | null) => {
  if (!topics) return [];
  return topics.map((topic) => ({
    _id: topic._id,
    name: topic.name,
    description: topic.description,
    difficultyLevel: topic.difficultyLevel,
    subjectId: (topic as any).subjectId?._id || topic.subjectId, // handles populated or raw ID
    subject: (topic as any).subjectId?.name || null,    // populated subject name
    departmentId: (topic as any).departmentId?._id || topic.departmentId,
    department: (topic as any).departmentId?.name || null, // populated department name
  }));
};
