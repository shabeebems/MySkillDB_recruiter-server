import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { LinkedInPostService } from "../services/linkedInPost.service";

export class LinkedInPostController {
  private linkedInPostService = new LinkedInPostService();

  public createLinkedInPost = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.linkedInPostService.createLinkedInPost((req as any).user?._id, req.body)
    );

  public getLinkedInPosts = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.linkedInPostService.getLinkedInPostsByStudentJobAndSkill(
        (req as any).user?._id,
        req.query.jobId as string,
        req.query.skillId as string
      )
    );

  public getLatestLinkedInPosts = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.linkedInPostService.getLatestLinkedInPosts((req as any).user?._id, 3)
    );

  public getLinkedInPostCount = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.linkedInPostService.getLinkedInPostCount((req as any).user?._id)
    );

  public getLinkedInPostsByStudent = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.linkedInPostService.getLinkedInPostsByStudentId((req as any).user?._id)
    );

  public deleteLinkedInPost = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.linkedInPostService.deleteLinkedInPost(req.params.id, (req as any).user?._id)
    );
}

