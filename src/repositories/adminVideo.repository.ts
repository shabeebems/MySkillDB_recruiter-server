import AdminVideoModel, { IAdminVideo } from "../models/adminVideo.model";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";

export class AdminVideoRepository extends BaseRepository<IAdminVideo> {
  constructor() {
    super(AdminVideoModel);
  }

  async findByOrganizationId(organizationId: string): Promise<IAdminVideo[]> {
    return AdminVideoModel.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<IAdminVideo[]>;
  }
}
