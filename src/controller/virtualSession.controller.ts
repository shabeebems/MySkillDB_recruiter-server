import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { VirtualSessionService } from "../services/virtualSession.service";

export class VirtualSessionController {
  private virtualSessionService = new VirtualSessionService();

  public createVirtualSession = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.virtualSessionService.createVirtualSession(
        req.body,
        (req as any).user?._id?.toString()
      )
    );

  public getVirtualSessionsByOrganization = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.virtualSessionService.getVirtualSessionsByOrganization(req.params.organizationId)
    );

  public getVirtualSessionById = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.virtualSessionService.getVirtualSessionById(req.params.sessionId)
    );

  public getNextForCurrentUser = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.virtualSessionService.getNextVirtualSessionForUser(
        (req as any).user?.organizationId?.toString(),
        (req as any).user?._id?.toString()
      )
    );

  public updateVirtualSession = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.virtualSessionService.updateVirtualSession(req.params.sessionId, req.body)
    );

  public deleteVirtualSession = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.virtualSessionService.deleteVirtualSession(req.params.sessionId)
    );
}
