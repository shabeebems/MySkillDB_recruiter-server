import { Types } from "mongoose";
import { CvStylePreferenceRepository } from "../../repositories/cvStylePreference.repository";
import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ICvStylePreference } from "../../models/cvStylePreference.model";

export class CvStylePreferenceService {
  private repository = new CvStylePreferenceRepository();

  public async getByUserId(userId: string): Promise<ServiceResponse> {
    const prefs = await this.repository.findByUserId(userId);
    return {
      success: true,
      message: Messages.CV_STYLE_FETCH_SUCCESS,
      data: prefs || {},
    };
  }

  public async createOrUpdate(
    userId: string,
    data: Partial<ICvStylePreference>
  ): Promise<ServiceResponse> {
    const { userId: _u, ...rest } = data as any;
    const defined: Record<string, unknown> = {};
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null) defined[k] = v;
    });
    const payload = {
      ...defined,
      userId: new Types.ObjectId(userId) as any,
    };
    const updated = await this.repository.upsertByUserId(userId, payload);
    return {
      success: true,
      message: Messages.CV_STYLE_SAVED_SUCCESS,
      data: updated,
    };
  }
}
