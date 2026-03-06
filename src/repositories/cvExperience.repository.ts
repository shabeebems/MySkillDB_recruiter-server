import CVExperienceModel, { ICVExperience } from "../models/cvExperience.model";
import { BaseRepository } from "./base.repository";

export class CVExperienceRepository extends BaseRepository<ICVExperience> {
  constructor() {
    super(CVExperienceModel);
  }

  findByUserId = (userId: string): Promise<ICVExperience[]> =>
    this.model.find({ userId });
}

