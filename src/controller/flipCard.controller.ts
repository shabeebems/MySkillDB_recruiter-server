import { Request, Response } from 'express';
import { handleRequest } from '../utils/handle-request.util';
import { FlipCardService } from '../services/flipCard.service';

export class FlipCardController {
  private flipCardService = new FlipCardService();

  public createFlipCard = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.flipCardService.createFlipCard(req.body));

  public getFlipCardsByJob = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.flipCardService.getFlipCardsByJob(req.params.jobId));

  public updateFlipCard = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.flipCardService.updateFlipCard(req.params.id, req.body));

  public deleteFlipCard = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.flipCardService.deleteFlipCard(req.params.id));

  public createBatchFlipCards = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.flipCardService.createBatchFlipCards(req.body.flipCards));
}

