import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ISection } from "../../models/section.model";
import { SectionRepository } from "../../repositories/section.repository";
import { formatSectionsOutput } from "../../views/organization-setup.view";
import { AssignmentRepository } from "../../repositories/assignment.repository";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("SectionService");


export class SectionService {
  private sectionRepository = new SectionRepository();
  private assignmentRepository = new AssignmentRepository();

  public async createSection(data: ISection): Promise<ServiceResponse> {
    const existingSection = await this.sectionRepository.findOne({
      name: data.name.trim(),
      organizationId: data.organizationId,
    });

    if (existingSection) {
      return {
        success: false,
        message: Messages.SECTION_ALREADY_EXISTS,
      };
    }

    await this.sectionRepository.create(data);

    return {
      success: true,
      message: Messages.SECTION_CREATED_SUCCESS,
    };
  }

  public async getAllSections(
    organizationId: string
  ): Promise<ServiceResponse> {
    const data = await this.sectionRepository.findByOrganizationId(
      organizationId
    );
    return {
      success: true,
      message: Messages.SECTION_FETCH_SUCCESS,
      data: formatSectionsOutput(data),
    };
  }

  public async getSectionsByClassFromAssignments(
    ids: any
  ): Promise<ServiceResponse> {
    const data =
      await this.assignmentRepository.findUniqueSectionsByDepartmentAndClass(
        ids.organizationId,
        ids.departmentId,
        ids.classId
      );
      log.info({ data: data }, "Sections by class from assignments:");
    return {
      success: true,
      message: Messages.SECTION_FETCH_SUCCESS,
      data,
    };
  }

  public async updateSection(
    id: string,
    payload: Partial<ISection>
  ): Promise<ServiceResponse> {
    // Check if name already exists in the same organization (excluding current section)
    if (payload.name && payload.organizationId) {
      const existingSection = await this.sectionRepository.findOne({
        name: payload.name.trim(),
        organizationId: payload.organizationId,
        _id: { $ne: id }, // exclude current section
      });

      if (existingSection) {
        return {
          success: false,
          message: Messages.SECTION_ALREADY_EXISTS,
        };
      }
    }

    const updated = await this.sectionRepository.update(id, payload);
    if (!updated) {
      return {
        success: false,
        message: Messages.SECTION_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: Messages.SECTION_UPDATED_SUCCESS,
    };
  }

  public async deleteSection(id: string): Promise<ServiceResponse> {
    const deleted = await this.sectionRepository.delete(id);
    if (!deleted)
      return { success: false, message: Messages.SECTION_NOT_FOUND };
    return {
      success: true,
      message: Messages.SECTION_DELETED_SUCCESS,
    };
  }
}
