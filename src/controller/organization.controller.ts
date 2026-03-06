import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";
import { handleRequest } from "../utils/handle-request.util";

export class OrganizationController {
  private organizationService = new OrganizationService();

  public createOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.organizationService.createOrganization(req.body)
    );

  public getOrganizations = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.organizationService.getOrganizations(req.query)
    );

  public getOrganizationById = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.organizationService.getOrganizationById(req.params.id)
    );

  public updateOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.organizationService.updateOrganization(req.params.id, req.body)
    );

  public changeStatus = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.organizationService.changeStatus(req.params.id, req.body.action)
    );
}
