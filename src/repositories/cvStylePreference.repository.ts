import CvStylePreferenceModel, {
  ICvStylePreference,
} from "../models/cvStylePreference.model";
import { BaseRepository } from "./base.repository";

export class CvStylePreferenceRepository extends BaseRepository<ICvStylePreference> {
  constructor() {
    super(CvStylePreferenceModel);
  }

  findByUserId = (userId: string): Promise<ICvStylePreference | null> =>
    this.model.findOne({ userId }).exec();

  upsertByUserId = (
    userId: string,
    data: Partial<ICvStylePreference>
  ): Promise<ICvStylePreference | null> =>
    this.model
      .findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, upsert: true, runValidators: true }
      )
      .exec();
}
