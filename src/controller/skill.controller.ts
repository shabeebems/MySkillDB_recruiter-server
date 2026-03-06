import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { SkillService } from "../services/skill.service";

export class SkillController {
  private skillService = new SkillService();

  public createSkill = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.skillService.createSkill(req.body));

  public getSkillsByJob = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.skillService.getSkillsByJob(req.params.jobId));

  public getSkillsByJobAndType = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => 
      this.skillService.getSkillsByJobAndType(req.params.jobId, req.query.type as string)
    );

  public getSkillById = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.skillService.getSkillById(req.params.skillId));

  public updateSkill = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.skillService.updateSkill(req.params.skillId, req.body));

  public deleteSkill = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.skillService.deleteSkill(req.params.skillId));
}

