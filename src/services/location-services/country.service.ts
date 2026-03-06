import { Messages } from "../../constants/messages";
import { CountryRepository } from "../../repositories/location-repositories/country.repository";
import { ICountry } from "../../models/country.model";
import { ServiceResponse } from "../types";
import { DistrictRepository } from "../../repositories/location-repositories/district.repository";
import { StateRepository } from "../../repositories/location-repositories/state.repository";
import { formatCountriesOutput } from "../../views/location.view";

export class CountryService {
  private countryRepo = new CountryRepository();
  private stateRepo = new StateRepository();
  private districtRepo = new DistrictRepository();

  public async createCountry(data: ICountry): Promise<ServiceResponse> {
    const newCountry = await this.countryRepo.create(data);
    return {
      success: true,
      message: Messages.COUNTRY_CREATED_SUCCESS,
      data: newCountry,
    };
  }

  public async getAllCountries(): Promise<ServiceResponse> {
    const countries = await this.countryRepo.findAll();
    return {
      success: true,
      message: Messages.COUNTRY_FETCH_SUCCESS,
      data: formatCountriesOutput(countries),
    };
  }

  public async updateCountry(
    id: string,
    data: Partial<ICountry>
  ): Promise<ServiceResponse> {
    const existingCountry = await this.countryRepo.findById(id);
    if (!existingCountry) {
      return {
        success: false,
        message: Messages.COUNTRY_NOT_FOUND,
        data: null,
      };
    }

    const oldCountryCode = existingCountry.countryCode;
    const newCountryCode = data.countryCode;

    const updatedCountry = await this.countryRepo.update(id, data);

    // If countryCode changed, use repository functions
    if (newCountryCode && newCountryCode !== oldCountryCode) {
      await this.stateRepo.updateCountryCode(oldCountryCode, newCountryCode);
      await this.districtRepo.updateCountryCode(oldCountryCode, newCountryCode);
    }

    return {
      success: true,
      message: Messages.COUNTRY_UPDATED_SUCCESS,
      data: updatedCountry,
    };
  }

  public async deleteCountry(id: string): Promise<ServiceResponse> {
    const country = await this.countryRepo.findById(id);
    if (!country) {
      return {
        success: false,
        message: Messages.COUNTRY_NOT_FOUND,
        data: null,
      };
    }

    const countryCode = country.countryCode;

    const deletedDistricts = await this.districtRepo.deleteByCountryCode(
      countryCode
    );

    const deletedStates = await this.stateRepo.deleteByCountryCode(countryCode);
    const deletedCountry = await this.countryRepo.delete(id);

    return {
      success: true,
      message: Messages.COUNTRY_DELETED_SUCCESS,
      data: {
        country: deletedCountry,
        statesDeleted: deletedStates,
        districtsDeleted: deletedDistricts,
      },
    };
  }
}
