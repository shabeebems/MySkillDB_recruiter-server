import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ISubject } from "../../models/subject.model";
import { SubjectRepository } from "../../repositories/subject.repository";
import { formatSubjectOutput } from "../../views/organization-setup.view";

export class SubjectService {
  private subjectRepository = new SubjectRepository();

  public async createSubject(data: ISubject): Promise<ServiceResponse> {
    const existingSubject = await this.subjectRepository.findOne({
      organizationId: data.organizationId,
      departmentId: data.departmentId,
      $or: [{ name: data.name.trim() }, { code: data.code?.trim() }],
    });

    if (existingSubject) {
      return {
        success: false,
        message: Messages.SUBJECT_ALREADY_EXISTS,
      };
    }

    await this.subjectRepository.create(data);
    return {
      success: true,
      message: Messages.SUBJECT_CREATED_SUCCESS,
    };
  }

  public async getAllSubjects(
    organizationId: string
  ): Promise<ServiceResponse> {
    const data =
      await this.subjectRepository.findAllByOrganizationWithDepartment(
        organizationId
      );
    return {
      success: true,
      message: Messages.SUBJECT_FETCH_SUCCESS,
      data: formatSubjectOutput(data),
    };
  }

  public async updateSubject(
    id: string,
    payload: Partial<ISubject>
  ): Promise<ServiceResponse> {
    // Only run check if name or code and organizationId & departmentId are provided
    if (
      (payload.name || payload.code) &&
      payload.organizationId &&
      payload.departmentId
    ) {
      const existingSubject = await this.subjectRepository.findOne({
        _id: { $ne: id }, // exclude current subject
        organizationId: payload.organizationId,
        departmentId: payload.departmentId,
        $or: [{ name: payload.name?.trim() }, { code: payload.code?.trim() }],
      });

      if (existingSubject) {
        return {
          success: false,
          message: Messages.SUBJECT_ALREADY_EXISTS,
        };
      }
    }

    // Proceed with update
    const updated = await this.subjectRepository.update(id, payload);
    if (!updated) {
      return {
        success: false,
        message: Messages.SUBJECT_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: Messages.SUBJECT_UPDATED_SUCCESS,
    };
  }

  public async deleteSubject(id: string): Promise<ServiceResponse> {
    const deleted = await this.subjectRepository.delete(id);
    if (!deleted)
      return { success: false, message: Messages.SUBJECT_NOT_FOUND };
    return {
      success: true,
      message: Messages.SUBJECT_DELETED_SUCCESS,
    };
  }

  public async getSubjectsByDepartment(ids: any): Promise<ServiceResponse> {
    const data = await this.subjectRepository.find({
      organizationId: ids.organizationId,
      departmentId: ids.departmentId,
    });
    return { message: Messages.SUBJECT_FETCH_SUCCESS, success: true, data };
  }
}
