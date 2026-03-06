import CVCertificateModel, { ICVCertificate } from "../models/cvCertificate.model";
import { BaseRepository } from "./base.repository";

export class CVCertificateRepository extends BaseRepository<ICVCertificate> {
  constructor() {
    super(CVCertificateModel);
  }

  findByUserId = (userId: string): Promise<ICVCertificate[]> =>
    this.model.find({ userId });
}

