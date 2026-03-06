import CVProjectModel, { ICVProject } from "../models/cvProject.model";
import { BaseRepository } from "./base.repository";

export class CVProjectRepository extends BaseRepository<ICVProject> {
  constructor() {
    super(CVProjectModel);
  }

  findByUserId = (userId: string): Promise<ICVProject[]> =>
    this.model.find({ userId });
}

