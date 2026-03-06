import OrganizationModel, { IOrganization } from "../models/organization.model";
import { BaseRepository } from "./base.repository";

export class OrganizationRepository extends BaseRepository<IOrganization> {
  constructor() {
    super(OrganizationModel);
  }

  public async existsByEmail(adminEmail: string): Promise<boolean> {
    const count = await this.model.countDocuments({ adminEmail }).exec();
    return count > 0;
  }

  public async existsByMobile(mobileNumber: string): Promise<boolean> {
    const count = await this.model.countDocuments({ mobileNumber }).exec();
    return count > 0;
  }

  public async existsByEmailExcludingId(adminEmail: string, excludeId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ 
      adminEmail,
      _id: { $ne: excludeId }
    }).exec();
    return count > 0;
  }

  public async existsByMobileExcludingId(mobileNumber: string, excludeId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ 
      mobileNumber,
      _id: { $ne: excludeId }
    }).exec();
    return count > 0;
  }

  public async findAllByFilter(query: any): Promise<IOrganization[]> {
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  public async findByFilter(
    query: any,
    skip: number = 0,
    limit: number = 5
  ): Promise<IOrganization[]> {
    return this.model
      .find(query)
      .sort({ createdAt: -1, _id: -1 }) // Add secondary sort by _id
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async getCountByFilter(query: any): Promise<number> {
    return this.model.countDocuments(query).exec();
  }

}
