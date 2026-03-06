import CompanyModel, { ICompany } from "../models/company.model";

export class CompanyRepository {
  public async findByNameAndOrg(
    name: string,
    organizationId: string
  ): Promise<ICompany | null> {
    return await CompanyModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive match
      organizationId,
    });
  }

  public async create(data: Partial<ICompany>): Promise<ICompany> {
    return await CompanyModel.create(data);
  }

  public async findById(id: string): Promise<ICompany | null> {
    return await CompanyModel.findById(id);
  }
}

