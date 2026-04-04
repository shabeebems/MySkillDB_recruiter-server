import CompanyModel, { ICompany } from "../models/company.model";
import { ServiceResponse } from "./types";
import { Types } from "mongoose";
import { escapeRegexLiteral, sanitizeSearchInput } from "../utils/regexEscape";

export type CompanyUserContext = {
  role: string;
  _id: Types.ObjectId | string;
};

/** Normalized key for deduplication (trimmed, lowercase). */
export function companyNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export class CompanyService {
  /**
   * Single global catalog: find by normalized name or create one row.
   * No duplicate companies for the same name (case-insensitive).
   */
  public async findOrCreateCompany(name: string): Promise<ICompany> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Company name is required");
    }
    const nameKey = companyNameKey(trimmed);

    const existing = await CompanyModel.findOne({ nameKey }).exec();
    if (existing) return existing;

    return CompanyModel.create({
      name: trimmed,
      nameKey,
    });
  }

  public async getCompanyById(companyId: string): Promise<ICompany | null> {
    return await CompanyModel.findById(companyId);
  }

  /**
   * All authenticated roles see the same company list (global catalog).
   */
  public async getAllCompanies(
    search: string | undefined,
    _user: CompanyUserContext
  ): Promise<ServiceResponse> {
    const query: Record<string, unknown> = {};

    if (search) {
      const safe = escapeRegexLiteral(sanitizeSearchInput(search));
      if (safe) {
        query.name = { $regex: safe, $options: "i" };
      }
    }

    const companies = await CompanyModel.find(query)
      .limit(500)
      .sort({ name: 1 })
      .exec();

    return {
      success: true,
      message: "Companies fetched successfully",
      data: companies,
    };
  }
}
