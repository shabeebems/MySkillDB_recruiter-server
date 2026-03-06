import { Types } from "mongoose";
import { CVProfileRepository } from "../../repositories/cvProfile.repository";
import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ICVProfile } from "../../models/cvProfile.model";

export class CVProfileService {
  private cvProfileRepository = new CVProfileRepository();

  public async getCVProfileByUserId(userId: string): Promise<ServiceResponse> {
    const profile = await this.cvProfileRepository.findByUserId(userId);
    return {
      success: true,
      message: Messages.CV_PROFILE_FETCH_SUCCESS,
      data: profile,
    };
  }

  public async createOrUpdateCVProfile(
    userId: string,
    data: Partial<ICVProfile>
  ): Promise<ServiceResponse> {
    const existingProfile = await this.cvProfileRepository.findByUserId(userId);
    
    if (existingProfile) {
      const profileId = (existingProfile as any)._id?.toString() || existingProfile.id;
      const updatedProfile = await this.cvProfileRepository.update(
        profileId,
        data
      );
      return {
        success: true,
        message: Messages.CV_PROFILE_UPDATED_SUCCESS,
        data: updatedProfile,
      };
    } else {
      const newProfile = await this.cvProfileRepository.create({
        userId: new Types.ObjectId(userId) as any,
        ...data,
      });
      return {
        success: true,
        message: Messages.CV_PROFILE_CREATED_SUCCESS,
        data: newProfile,
      };
    }
  }
}

