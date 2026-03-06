import { Request, Response } from "express";
import { SystemSettingService } from "../services/systemSetting.service";
import { handleRequest } from "../utils/handle-request.util";

export class SystemSettingController {
  private service = new SystemSettingService();

  public addOrUpdateValue = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.service.addOrUpdateValue(req.params.systemCode, req.body.value)
    );

  public getValuesBySystemCode = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.service.getValuesBySystemCode(req.params.systemCode)
    );
  
  public deleteValueBySystemCode = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.service.deleteValueBySystemCode(req.params.systemCode, req.body.value)
    );
}
