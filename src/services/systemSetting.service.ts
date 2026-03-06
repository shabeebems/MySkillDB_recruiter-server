import { SystemSettingRepository } from "../repositories/systemSetting.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { formatSystemSettingOutput } from "../views/systemSetting.view";

export class SystemSettingService {
  private repo = new SystemSettingRepository();

  public async addOrUpdateValue(
    systemCode: string,
    value: string
  ): Promise<ServiceResponse> {
    const updated = await this.repo.upsertValue(systemCode, value);
    return {
      success: true,
      message: Messages.SYSTEM_SETTING_UPDATED_SUCCESS,
      data: formatSystemSettingOutput(updated),
    };
  }

  public async getValuesBySystemCode(
    systemCode: string
  ): Promise<ServiceResponse> {
    const result = await this.repo.findBySystemCode(systemCode);
    return {
      success: true,
      message: Messages.SYSTEM_SETTING_FETCH_SUCCESS,
      data: formatSystemSettingOutput(result),
    };
  }

  public async deleteValueBySystemCode(
    systemCode: string,
    value: string
  ): Promise<ServiceResponse> {
    const updated = await this.repo.deleteValue(systemCode, value);
    return {
      success: true,
      message: Messages.SYSTEM_SETTING_UPDATED_SUCCESS,
      data: formatSystemSettingOutput(updated),
    };
  }
}
