import { Types } from "mongoose";
import { CVProjectRepository } from "../../repositories/cvProject.repository";
import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ICVProject } from "../../models/cvProject.model";

export class CVProjectService {
  private cvProjectRepository = new CVProjectRepository();

  public async getCVProjectByUserId(userId: string): Promise<ServiceResponse> {
    const projects = await this.cvProjectRepository.findByUserId(userId);
    return {
      success: true,
      message: Messages.CV_PROJECT_FETCH_SUCCESS,
      data: projects,
    };
  }

  public async createCVProject(
    userId: string,
    data: Partial<ICVProject>
  ): Promise<ServiceResponse> {
    const newProject = await this.cvProjectRepository.create({
      userId: new Types.ObjectId(userId) as any,
      ...data,
    });
    return {
      success: true,
      message: Messages.CV_PROJECT_CREATED_SUCCESS,
      data: newProject,
    };
  }

  public async updateCVProject(
    id: string,
    data: Partial<ICVProject>
  ): Promise<ServiceResponse> {
    const updatedProject = await this.cvProjectRepository.update(id, data);
    if (!updatedProject) {
      return {
        success: false,
        message: Messages.CV_PROJECT_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_PROJECT_UPDATED_SUCCESS,
      data: updatedProject,
    };
  }

  public async deleteCVProject(id: string): Promise<ServiceResponse> {
    const deletedProject = await this.cvProjectRepository.delete(id);
    if (!deletedProject) {
      return {
        success: false,
        message: Messages.CV_PROJECT_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_PROJECT_DELETED_SUCCESS,
      data: deletedProject,
    };
  }
}

