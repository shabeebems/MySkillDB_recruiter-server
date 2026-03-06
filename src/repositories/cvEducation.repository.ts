import CVEducationModel, { ICVEducation } from "../models/cvEducation.model";
import { BaseRepository } from "./base.repository";

export class CVEducationRepository extends BaseRepository<ICVEducation> {
  constructor() {
    super(CVEducationModel);
  }

  findByUserId = (userId: string): Promise<ICVEducation[]> =>
    this.model.find({ userId });
}

