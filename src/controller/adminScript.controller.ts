import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { AdminScriptService } from "../services/adminScript.service";

export class AdminScriptController {
  private adminScriptService = new AdminScriptService();

  public getByOrganizationId = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.adminScriptService.getByOrganizationId(
        req.params.organizationId,
        (req.query.jobId as string) || undefined
      )
    );

  public getSections = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.adminScriptService.getSections(req.params.id)
    );

  public deleteAdminScript = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      let organizationId = (req as any).user?.organizationId?.toString?.();
      if (!organizationId && (req as any).user?.role === "master_admin") {
        const script = await this.adminScriptService.getById(req.params.id);
        if (script?.organizationId) organizationId = String(script.organizationId);
      }
      if (!organizationId) {
        throw new Error("organizationId is required");
      }
      return this.adminScriptService.deleteAdminScript(req.params.id, organizationId);
    });
}
