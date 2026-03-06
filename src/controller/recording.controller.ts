import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { RecordingService } from "../services/recording.service";

export class RecordingController {
  private recordingService = new RecordingService();

  public createRecording = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () => {
      return this.recordingService.createRecording(req.body);
    });

  public getRecordingsBySubjectIdAndTopicId = (
    req: Request,
    res: Response
  ): Promise<void> =>
    handleRequest(
      res,
      () =>
        this.recordingService.getRecordingsBySubjectIdAndTopicId(
          req.params.subjectId,
          req.params.topicId
        )
    );

  public getRecordingsByTopicIds = (
    req: Request,
    res: Response
  ): Promise<void> =>
    handleRequest(
      res,
      () => this.recordingService.getRecordingsByTopicIds(req.query.topicIds as string[] | string | undefined)
    );

  public deleteRecording = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.recordingService.deleteRecording(req.params.recordingId));

  public getRecordingsBySubjectId = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.recordingService.getRecordingsBySubjectId(req.params.subjectId));

  public getRecordingsByJobId = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.recordingService.getRecordingsByJobId(req.params.jobId));

  public getRecordingsBySkillId = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.recordingService.getRecordingsBySkillId(req.params.skillId));
}

