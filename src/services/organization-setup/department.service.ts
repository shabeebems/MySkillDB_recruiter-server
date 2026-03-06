import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { IDepartment } from "../../models/department.model";
import { DepartmentRepository } from "../../repositories/department.repository";
import { formatDepartmentsOutput } from "../../views/organization-setup.view";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("DepartmentService");


export class DepartmentService {
  private departmentRepository = new DepartmentRepository();

  public async createDepartment(data: IDepartment): Promise<ServiceResponse> {
    const existingDepartment = await this.departmentRepository.findOne({
      name: data.name.trim(),
      organizationId: data.organizationId,
    });

    if (existingDepartment) {
      return {
        success: false,
        message: Messages.DEPARTMENT_ALREADY_EXISTS,
      };
    }

    const created = await this.departmentRepository.create(data);

    return {
      success: true,
      message: Messages.DEPARTMENT_CREATED_SUCCESS,
    };
  }

  public async getAllDepartments(
    organizationId: string
  ): Promise<ServiceResponse> {
    const data = await this.departmentRepository.findByOrganizationId(
      organizationId
    );
    return {
      success: true,
      message: Messages.DEPARTMENT_FETCH_SUCCESS,
      data: formatDepartmentsOutput(data),
    };
  }

  public async updateDepartment(
    id: string,
    payload: Partial<IDepartment>
  ): Promise<ServiceResponse> {
    // If name is being updated, check for duplicates
    log.info({ data: payload }, "Checking for existing department with name:");
    if (payload.name && payload.organizationId) {
      const existingDepartment = await this.departmentRepository.findOne({
        name: payload.name.trim(),
        organizationId: payload.organizationId,
        _id: { $ne: id }, // Exclude current department from check
      });

      if (existingDepartment) {
        return {
          success: false,
          message: Messages.DEPARTMENT_ALREADY_EXISTS,
        };
      }
    }

    const updated = await this.departmentRepository.update(id, payload);
    if (!updated) {
      return {
        success: false,
        message: Messages.DEPARTMENT_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: Messages.DEPARTMENT_UPDATED_SUCCESS
    };
  }

  public async deleteDepartment(id: string): Promise<ServiceResponse> {
    const deleted = await this.departmentRepository.delete(id);
    if (!deleted)
      return { success: false, message: Messages.DEPARTMENT_NOT_FOUND };
    return {
      success: true,
      message: Messages.DEPARTMENT_DELETED_SUCCESS,
    };
  }

  public async getDepartmentCount(organizationId: string): Promise<ServiceResponse> {
    const count = await this.departmentRepository.countByOrganization(organizationId);
    return {
      success: true,
      message: Messages.DEPARTMENT_FETCH_SUCCESS,
      data: { count },
    };
  }
}
