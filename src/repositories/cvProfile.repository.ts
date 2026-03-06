import CVProfileModel, { ICVProfile } from "../models/cvProfile.model";
import { BaseRepository } from "./base.repository";

export class CVProfileRepository extends BaseRepository<ICVProfile> {
  constructor() {
    super(CVProfileModel);
  }

  findByUserId = (userId: string): Promise<ICVProfile | null> =>
    this.model.findOne({ userId });
}

