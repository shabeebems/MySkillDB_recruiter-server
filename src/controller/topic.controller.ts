import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { TopicService } from "../services/topic.service";

export class TopicController {
  private topicService = new TopicService();

  public createTopic = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.topicService.createTopic(req.body));

  public getTopicsBySubject = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.topicService.getTopicsBySubject(req.params.subjectId));

  public updateTopic = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.topicService.updateTopic(req.params.topicId, req.body));

  public deleteTopic = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.topicService.deleteTopic(req.params.topicId));

  public createBatchTopics = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.topicService.createBatchTopics(req.body.topics || []));
}
