import { Types } from "mongoose";
import { CVEducationRepository } from "../../repositories/cvEducation.repository";
import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ICVEducation } from "../../models/cvEducation.model";

export class CVEducationService {
  private cvEducationRepository = new CVEducationRepository();

  public async getCVEducationByUserId(userId: string): Promise<ServiceResponse> {
    const education = await this.cvEducationRepository.findByUserId(userId);
    return {
      success: true,
      message: Messages.CV_EDUCATION_FETCH_SUCCESS,
      data: education,
    };
  }

  public async createCVEducation(
    userId: string,
    data: Partial<ICVEducation>
  ): Promise<ServiceResponse> {
    const newEducation = await this.cvEducationRepository.create({
      userId: new Types.ObjectId(userId) as any,
      ...data,
    });
    return {
      success: true,
      message: Messages.CV_EDUCATION_CREATED_SUCCESS,
      data: newEducation,
    };
  }

  public async updateCVEducation(
    id: string,
    data: Partial<ICVEducation>
  ): Promise<ServiceResponse> {
    const updatedEducation = await this.cvEducationRepository.update(id, data);
    if (!updatedEducation) {
      return {
        success: false,
        message: Messages.CV_EDUCATION_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_EDUCATION_UPDATED_SUCCESS,
      data: updatedEducation,
    };
  }

  public async deleteCVEducation(id: string): Promise<ServiceResponse> {
    const deletedEducation = await this.cvEducationRepository.delete(id);
    if (!deletedEducation) {
      return {
        success: false,
        message: Messages.CV_EDUCATION_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_EDUCATION_DELETED_SUCCESS,
      data: deletedEducation,
    };
  }
}

