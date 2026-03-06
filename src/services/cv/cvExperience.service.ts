import { Types } from "mongoose";
import { CVExperienceRepository } from "../../repositories/cvExperience.repository";
import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ICVExperience } from "../../models/cvExperience.model";

export class CVExperienceService {
  private cvExperienceRepository = new CVExperienceRepository();

  public async getCVExperienceByUserId(userId: string): Promise<ServiceResponse> {
    const experience = await this.cvExperienceRepository.findByUserId(userId);
    return {
      success: true,
      message: Messages.CV_EXPERIENCE_FETCH_SUCCESS,
      data: experience,
    };
  }

  public async createCVExperience(
    userId: string,
    data: Partial<ICVExperience>
  ): Promise<ServiceResponse> {
    const newExperience = await this.cvExperienceRepository.create({
      userId: new Types.ObjectId(userId) as any,
      ...data,
    });
    return {
      success: true,
      message: Messages.CV_EXPERIENCE_CREATED_SUCCESS,
      data: newExperience,
    };
  }

  public async updateCVExperience(
    id: string,
    data: Partial<ICVExperience>
  ): Promise<ServiceResponse> {
    const updatedExperience = await this.cvExperienceRepository.update(id, data);
    if (!updatedExperience) {
      return {
        success: false,
        message: Messages.CV_EXPERIENCE_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_EXPERIENCE_UPDATED_SUCCESS,
      data: updatedExperience,
    };
  }

  public async deleteCVExperience(id: string): Promise<ServiceResponse> {
    const deletedExperience = await this.cvExperienceRepository.delete(id);
    if (!deletedExperience) {
      return {
        success: false,
        message: Messages.CV_EXPERIENCE_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_EXPERIENCE_DELETED_SUCCESS,
      data: deletedExperience,
    };
  }
}

