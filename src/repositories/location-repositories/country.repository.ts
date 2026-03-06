import countryModel, { ICountry } from "../../models/country.model";
import { BaseRepository } from "../base.repository";

export class CountryRepository extends BaseRepository<ICountry> {
  constructor() {
    super(countryModel);
  }
}
