import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { AdminVideoService } from "../services/adminVideo.service";

export class AdminVideoController {
  private adminVideoService = new AdminVideoService();

  public getByOrganizationId = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.adminVideoService.getByOrganizationId(req.params.organizationId)
    );

  public create = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => {
      const userId = (req as any).user?._id?.toString?.();
      const organizationId = (req as any).user?.organizationId?.toString?.();
      if (!organizationId) {
        return Promise.resolve({
          success: false,
          message: "Organization context required",
          data: null,
        });
      }
      const { title, videoBase64, description } = req.body || {};
      return this.adminVideoService.create({
        organizationId,
        title,
        videoBase64,
        description,
        createdBy: userId,
      });
    });
}
