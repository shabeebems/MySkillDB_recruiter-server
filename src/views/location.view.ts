import { ICountry } from "../models/country.model";
import { IState } from "../models/state.model";
import { IDistrict } from "../models/district.model";

export const formatCountriesOutput = (countries: ICountry[] | null) => {
  if (!countries) return [];
  return countries.map((country) => ({
    _id: country._id,
    name: country.country,
    code: country.countryCode,
  }));
};

export const formatStatesOutput = (states: IState[] | null) => {
  if (!states) return [];
  return states.map((state) => ({
    _id: state._id,
    name: state.state,
    code: state.stateCode,
    countryCode: state.countryCode,
  }));
};

export const formatDistrictsOutput = (districts: IDistrict[] | null) => {
  if (!districts) return [];
  return districts.map(district => ({
    _id: district._id,
    name: district.district,
    code: district.districtCode,
    stateCode: district.stateCode,
    countryCode: district.countryCode,
  }));
};
