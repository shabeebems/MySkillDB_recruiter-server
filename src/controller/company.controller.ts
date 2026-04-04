import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { CompanyService } from "../services/company.service";

export class CompanyController {
  private companyService = new CompanyService();

  public getCompanies = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => {
      const user = (req as any).user;
      return this.companyService.getAllCompanies(
        req.query.search as string | undefined,
        { role: user.role, _id: user._id }
      );
    });
}

