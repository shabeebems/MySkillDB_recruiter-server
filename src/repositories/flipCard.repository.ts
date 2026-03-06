import FlipCardModel, { IFlipCard } from '../models/flipCard.model';
import { BaseRepository } from './base.repository';

export class FlipCardRepository extends BaseRepository<IFlipCard> {
  constructor() {
    super(FlipCardModel);
  }

  // Find flip cards by jobId
  async findByJobId(jobId: string): Promise<IFlipCard[]> {
    return await FlipCardModel.find({ jobId })
      .populate('skillId', 'name _id')
      .exec();
  }

  // Bulk create flip cards
  async createMany(data: Partial<IFlipCard>[]): Promise<IFlipCard[]> {
    return await FlipCardModel.insertMany(data) as unknown as IFlipCard[];
  }
}

