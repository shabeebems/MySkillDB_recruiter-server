import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { IClass } from "../../models/class.model";
import { ClassRepository } from "../../repositories/class.repository";
import { formatClassOutput } from "../../views/organization-setup.view";
import { AssignmentRepository } from "../../repositories/assignment.repository";

export class ClassService {
  private classRepository = new ClassRepository();
  private assignmentRepository = new AssignmentRepository();

  public async createClass(data: IClass): Promise<ServiceResponse> {
    const existingClass = await this.classRepository.findOne({
      name: data.name.trim(),
      organizationId: data.organizationId,
    });

    if (existingClass) {
      return {
        success: false,
        message: Messages.CLASS_ALREADY_EXISTS,
      };
    }

    await this.classRepository.create(data);
    return {
      success: true,
      message: Messages.CLASS_CREATED_SUCCESS,
    };
  }

  public async getAllClasses(organizationId: string): Promise<ServiceResponse> {
    const data = await this.classRepository.findByOrganizationId(
      organizationId
    );
    return {
      success: true,
      message: Messages.CLASS_FETCH_SUCCESS,
      data: formatClassOutput(data),
    };
  }

  public async getClassesByDepartmentsFromAssignments(
    ids: any
  ): Promise<ServiceResponse> {
    const data = await this.assignmentRepository.findUniqueClassesByDepartment(
      ids.organizationId,
      ids.departmentId
    );
    return {
      success: true,
      message: Messages.CLASS_FETCH_SUCCESS,
      data,
    };
  }

  public async updateClass(
    id: string,
    payload: Partial<IClass>
  ): Promise<ServiceResponse> {
    // Check if name already exists in the same organization (excluding current class)
    if (payload.name && payload.organizationId) {
      const existingClass = await this.classRepository.findOne({
        name: payload.name.trim(),
        organizationId: payload.organizationId,
        _id: { $ne: id }, // exclude current class
      });

      if (existingClass) {
        return {
          success: false,
          message: Messages.CLASS_ALREADY_EXISTS,
        };
      }
    }

    // Proceed with update
    const updated = await this.classRepository.update(id, payload);
    if (!updated) {
      return {
        success: false,
        message: Messages.CLASS_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: Messages.CLASS_UPDATED_SUCCESS,
    };
  }

  public async deleteClass(id: string): Promise<ServiceResponse> {
    const deleted = await this.classRepository.delete(id);
    if (!deleted) return { success: false, message: Messages.CLASS_NOT_FOUND };
    return {
      success: true,
      message: Messages.CLASS_DELETED_SUCCESS,
    };
  }
}
