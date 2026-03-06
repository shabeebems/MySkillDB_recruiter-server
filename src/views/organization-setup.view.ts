import { IClass } from "../models/class.model";
import { IDepartment } from "../models/department.model";
import { ISection } from "../models/section.model";
import { ISubject } from "../models/subject.model";

export const formatDepartmentsOutput = (departments: IDepartment[] | null) => {
  if (!departments) return [];
  return departments.map((dept) => ({
    _id: dept._id,
    name: dept.name,
    description: dept.description,
  }));
};

export const formatClassOutput = (classes: IClass[] | null) => {
  if (!classes) return [];
  return classes.map((cls) => ({
    _id: cls._id,
    name: cls.name,
    description: cls.description,
  }));
};

export const formatSectionsOutput = (sections: ISection[] | null) => {
  if (!sections) return [];
  return sections.map((section) => ({
    _id: section._id,
    name: section.name,
    description: section.description,
  }));
};

export const formatSubjectOutput = (
  subjects: (ISubject & { departmentId?: any })[] | null
) => {
  if (!subjects) return [];
  return subjects.map((subject) => ({
    _id: subject._id,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    department: subject.departmentId?.name,
  }));
};

export const formatClassSectionView = (records: any[] | null) => {
  if (!records) return [];
  return records.map((record) => ({
    _id: record._id,
    section: record.sectionId?.name,
  }));
};

export const formatAssignmentOutput = (assignment: any | null) => {
  if (!assignment) return null;
  return {
    _id: assignment._id,
    section: assignment.sectionId?.name || null,
    class: assignment.classId?.name || null,
    department: assignment.departmentId?.name || null,
    departmentId: assignment.departmentId?._id || null,
  };
};