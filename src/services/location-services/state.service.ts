import { Messages } from "../../constants/messages";
import { StateRepository } from "../../repositories/location-repositories/state.repository";
import { DistrictRepository } from "../../repositories/location-repositories/district.repository";
import { IState } from "../../models/state.model";
import { ServiceResponse } from "../types";
import { formatStatesOutput } from "../../views/location.view";

export class StateService {
  private stateRepo = new StateRepository();
  private districtRepo = new DistrictRepository();

  public async createState(data: IState): Promise<ServiceResponse> {
    const newState = await this.stateRepo.create(data);
    return {
      success: true,
      message: Messages.STATE_CREATED_SUCCESS,
      data: newState,
    };
  }

  public async getStatesByCountryCode(
    countryCode: string
  ): Promise<ServiceResponse> {
    let states;
    if (countryCode === "all") {
      states = await this.stateRepo.findAll();
    } else {
      states = await this.stateRepo.findByCountryCode(countryCode);
    }
    return {
      success: true,
      message: Messages.STATE_FETCH_SUCCESS,
      data: formatStatesOutput(states),
    };
  }

  public async updateState(
    id: string,
    data: Partial<IState>
  ): Promise<ServiceResponse> {
    const existingState = await this.stateRepo.findById(id);
    if (!existingState) {
      return { success: false, message: Messages.STATE_NOT_FOUND, data: null };
    }

    const oldStateCode = existingState.stateCode;
    const oldCountryCode = existingState.countryCode;
    const newStateCode = data.stateCode;
    const newCountryCode = data.countryCode;

    const updatedState = await this.stateRepo.update(id, data);

    // If stateCode changed, update all districts
    if (newStateCode && newStateCode !== oldStateCode) {
      await this.districtRepo.updateStateCode(oldStateCode, newStateCode);
    }

    // If countryCode changed, update all districts
    if (newCountryCode && newCountryCode !== oldCountryCode) {
      await this.districtRepo.updateCountryCode(oldCountryCode, newCountryCode);
    }

    return {
      success: true,
      message: Messages.STATE_UPDATED_SUCCESS,
      data: updatedState,
    };
  }

  public async deleteState(id: string): Promise<ServiceResponse> {
    const existingState = await this.stateRepo.findById(id);
    if (!existingState) {
      return { success: false, message: Messages.STATE_NOT_FOUND, data: null };
    }

    // Delete all districts related to this state
    await this.districtRepo.deleteByStateCode(existingState.stateCode);

    const deletedState = await this.stateRepo.delete(id);

    return {
      success: true,
      message: Messages.STATE_DELETED_SUCCESS,
      data: deletedState,
    };
  }
}
