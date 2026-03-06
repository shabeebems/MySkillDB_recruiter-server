import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { IOrganization } from "../models/organization.model";
import { OrganizationRepository } from "../repositories/organization.repository";
import { formatOrganizationsOutput } from "../views/organization.view";
import { UserService } from "./users.service";
import { IUser } from "../models/user.model";

export class OrganizationService {
  private organizationRepository = new OrganizationRepository();
  private userService = new UserService();

  public async createOrganization(
    data: IOrganization
  ): Promise<ServiceResponse> {
    if (await this.organizationRepository.existsByEmail(data.adminEmail)) {
      return { success: false, message: Messages.ADMIN_EMAIL_ALREADY_EXISTS };
    }

    if (await this.organizationRepository.existsByMobile(data.mobileNumber)) {
      return { success: false, message: Messages.MOBILE_NUMBER_ALREADY_EXISTS };
    }

    const newOrganization = await this.organizationRepository.create(data);

    const orgAdminData = {
      organizationId: newOrganization._id,
      name: newOrganization.adminName,
      email: newOrganization.adminEmail,
      mobile: newOrganization.mobileNumber,
      role: "org_admin",
    };

    await this.userService.createUser(orgAdminData as IUser);
    return {
      success: true,
      message: Messages.ORGANIZATION_CREATED_SUCCESS,
      data: newOrganization,
    };
  }

  public async getOrganizations(filters: any): Promise<ServiceResponse> {
    const query: any = {};
    // Filters
    if (filters.name) query.name = { $regex: filters.name, $options: "i" };
    if (filters.country)
      query.country = { $regex: filters.country, $options: "i" };
    if (filters.state) query.state = { $regex: filters.state, $options: "i" };
    if (filters.district)
      query.district = { $regex: filters.district, $options: "i" };
    if (filters.status) 
      query.status = filters.status;
    if (filters.isSetupCompleted !== undefined)
      query.isSetupCompleted = filters.isSetupCompleted;

    // If pagination params exist
    if (filters.page || filters.limit) {
      const page = parseInt(filters.page as string) || 1;
      const limit = parseInt(filters.limit as string) || 5;
      const skip = (page - 1) * limit;

      const organizations = await this.organizationRepository.findByFilter(
        query,
        skip,
        limit
      );

      const totalCount = await this.organizationRepository.getCountByFilter(
        query
      );
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: Messages.ORGANIZATION_FETCH_SUCCESS,
        data: {
          organizations: formatOrganizationsOutput(organizations),
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit,
          },
        },
      };
    } else {
      // No pagination → return all results
      const organizations = await this.organizationRepository.findAllByFilter(
        query
      );
      return {
        success: true,
        message: Messages.ORGANIZATION_FETCH_SUCCESS,
        data: formatOrganizationsOutput(organizations),
      };
    }
  }

  public async getOrganizationById(id: string): Promise<ServiceResponse> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      return { success: false, message: Messages.ORGANIZATION_NOT_FOUND };
    }
    return {
      success: true,
      message: Messages.ORGANIZATION_FETCH_SUCCESS,
      data: org,
    };
  }

  public async updateOrganization(
    id: string,
    data: Partial<IOrganization>
  ): Promise<ServiceResponse> {
    // Check if organization exists
    const existingOrg = await this.organizationRepository.findById(id);
    if (!existingOrg) {
      return { success: false, message: Messages.ORGANIZATION_NOT_FOUND };
    }

    // Check if email already exists for a different organization
    if (data.adminEmail && data.adminEmail !== existingOrg.adminEmail) {
      if (await this.organizationRepository.existsByEmailExcludingId(data.adminEmail, id)) {
        return { success: false, message: Messages.ADMIN_EMAIL_ALREADY_EXISTS };
      }
    }

    // Check if mobile already exists for a different organization
    if (data.mobileNumber && data.mobileNumber !== existingOrg.mobileNumber) {
      if (await this.organizationRepository.existsByMobileExcludingId(data.mobileNumber, id)) {
        return { success: false, message: Messages.MOBILE_NUMBER_ALREADY_EXISTS };
      }
    }

    const updated = await this.organizationRepository.update(id, data);
    if (!updated) {
      return { success: false, message: Messages.ORGANIZATION_NOT_FOUND };
    }
    return {
      success: true,
      message: Messages.ORGANIZATION_UPDATED_SUCCESS,
      data: updated,
    };
  }

  public async changeStatus(
    id: string,
    action: "accept" | "reject"
  ): Promise<ServiceResponse> {
    const newStatus = action === "accept" ? "active" : "rejected";
    const updated = await this.organizationRepository.update(id, {
      status: newStatus,
    });
    if (!updated) {
      return { success: false, message: Messages.ORGANIZATION_NOT_FOUND };
    }
    return {
      success: true,
      message: `Organization ${action}ed successfully`,
      data: updated,
    };
  }
}
