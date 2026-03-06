import systemSettingModel, {
  ISystemSetting,
} from "../models/systemSetting.model";
import { BaseRepository } from "./base.repository";

export class SystemSettingRepository extends BaseRepository<ISystemSetting> {
  constructor() {
    super(systemSettingModel);
  }

  public async upsertValue(
    systemCode: string,
    value: string
  ): Promise<ISystemSetting> {
    return this.model
      .findOneAndUpdate(
        { systemCode },
        { $addToSet: { values: value } },
        { new: true, upsert: true }
      )
      .exec();
  }

  public async findBySystemCode(
    systemCode: string
  ): Promise<ISystemSetting | null> {
    return this.model.findOne({ systemCode }).exec();
  }

  public async deleteValue(
    systemCode: string,
    value: string
  ): Promise<ISystemSetting | null> {
    return this.model
      .findOneAndUpdate(
        { systemCode },
        { $pull: { values: value } },
        { new: true }
      )
      .exec();
  }
}
