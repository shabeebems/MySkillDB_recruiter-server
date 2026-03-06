import stateModel, { IState } from "../../models/state.model";
import { BaseRepository } from "../base.repository";

export class StateRepository extends BaseRepository<IState> {
  constructor() {
    super(stateModel);
  }

  public async findByCountryCode(countryCode: string): Promise<IState[]> {
    return this.model.find({ countryCode }).exec();
  }

  public async deleteByCountryCode(countryCode: string): Promise<number> {
    const result = await this.model.deleteMany({ countryCode }).exec();
    return result.deletedCount || 0;
  }

  public async updateCountryCode(oldCode: string, newCode: string) {
    return this.model.updateMany({ countryCode: oldCode }, { $set: { countryCode: newCode } }).exec();
  }
}
