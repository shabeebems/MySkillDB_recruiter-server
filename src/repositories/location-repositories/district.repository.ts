import districtModel, { IDistrict } from "../../models/district.model";
import { BaseRepository } from "../base.repository";

export class DistrictRepository extends BaseRepository<IDistrict> {
  constructor() {
    super(districtModel);
  }

  public async findByStateCode(stateCode: string): Promise<IDistrict[]> {
    return this.model.find({ stateCode }).exec();
  }

  public async findByCountryCode(countryCode: string): Promise<IDistrict[]> {
    return this.model.find({ countryCode }).exec();
  }

  public async deleteByCountryCode(countryCode: string): Promise<number> {
    const result = await this.model.deleteMany({ countryCode }).exec();
    return result.deletedCount || 0;
  }

  public async deleteByStateCode(stateCode: string): Promise<number> {
    const result = await this.model.deleteMany({ stateCode }).exec();
    return result.deletedCount || 0;
  }

  public async updateCountryCode(oldCode: string, newCode: string) {
    return this.model.updateMany({ countryCode: oldCode }, { $set: { countryCode: newCode } }).exec();
  }

  public async updateStateCode(oldCode: string, newCode: string) {
    return this.model.updateMany({ stateCode: oldCode }, { $set: { stateCode: newCode } }).exec();
  }
}
