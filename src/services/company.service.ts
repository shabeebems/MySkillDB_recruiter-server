import CompanyModel, { ICompany } from "../models/company.model";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";

export class CompanyService {
  public async findOrCreateCompany(name: string): Promise<ICompany> {
    const existingCompany = await CompanyModel.findOne({ name });
    if (existingCompany) {
      return existingCompany;
    }

    return await CompanyModel.create({
      name,
    });
  }

  public async getCompanyById(companyId: string): Promise<ICompany | null> {
    return await CompanyModel.findById(companyId);
  }

  public async getAllCompanies(search?: string): Promise<ServiceResponse> {
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    
    const companies = await CompanyModel.find(query).limit(50).sort({ name: 1 });
    
    return {
      success: true,
      message: "Companies fetched successfully",
      data: companies,
    };
  }
}
