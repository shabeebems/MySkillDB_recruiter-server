import { Messages } from "../../constants/messages";
import { DistrictRepository } from "../../repositories/location-repositories/district.repository";
import { IDistrict } from "../../models/district.model";
import { ServiceResponse } from "../types";
import { formatDistrictsOutput } from "../../views/location.view";

export class DistrictService {
  private districtRepo = new DistrictRepository();

  public async createDistrict(data: IDistrict): Promise<ServiceResponse> {
    const newDistrict = await this.districtRepo.create(data);
    return {
      success: true,
      message: Messages.DISTRICT_CREATED_SUCCESS,
      data: newDistrict,
    };
  }

  public async getDistrictsByStateCode(
    stateCode: string
  ): Promise<ServiceResponse> {
    let districts;
    if (stateCode === "all") {
      districts = await this.districtRepo.findAll();
    } else {
      districts = await this.districtRepo.findByStateCode(stateCode);
    }
    return {
      success: true,
      message: Messages.DISTRICT_FETCH_SUCCESS,
      data: formatDistrictsOutput(districts),
    };
  }

  public async getDistrictsByCountryCode(
    countryCode: string
  ): Promise<ServiceResponse> {
    let districts;
    if (countryCode === "all") {
      districts = await this.districtRepo.findAll();
    } else {
      districts = await this.districtRepo.findByCountryCode(countryCode);
    }
    return {
      success: true,
      message: Messages.DISTRICT_FETCH_SUCCESS,
      data: formatDistrictsOutput(districts),
    };
  }

  public async updateDistrict(
    id: string,
    data: Partial<IDistrict>
  ): Promise<ServiceResponse> {
    const updated = await this.districtRepo.update(id, data);
    return {
      success: true,
      message: Messages.DISTRICT_UPDATED_SUCCESS,
      data: updated,
    };
  }

  public async deleteDistrict(id: string): Promise<ServiceResponse> {
    const deleted = await this.districtRepo.delete(id);
    return {
      success: true,
      message: Messages.DISTRICT_DELETED_SUCCESS,
      data: deleted,
    };
  }
}
