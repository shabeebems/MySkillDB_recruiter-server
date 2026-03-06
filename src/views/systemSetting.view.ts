import { ISystemSetting } from "../models/systemSetting.model";

export const formatSystemSettingOutput = (system: ISystemSetting | null) => {
  if (!system) return null;
  return system.values;
};
