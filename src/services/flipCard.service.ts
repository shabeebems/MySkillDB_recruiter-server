import { FlipCardRepository } from '../repositories/flipCard.repository';
import { Messages } from '../constants/messages';
import { ServiceResponse } from './types';
import { IFlipCard } from '../models/flipCard.model';

export class FlipCardService {
  private flipCardRepository = new FlipCardRepository();

  public async createFlipCard(data: IFlipCard): Promise<ServiceResponse> {
    // Validate that correctAnswer exists in options array
    if (!data.options.includes(data.correctAnswer)) {
      return {
        success: false,
        message: 'Correct answer must be one of the provided options',
        data: null,
      };
    }

    try {
      const newFlipCard = await this.flipCardRepository.create(data);
      
      // Populate skillId to match the fetch response format
      if (newFlipCard) {
        await newFlipCard.populate('skillId', 'name _id');
      }
      
      return {
        success: true,
        message: Messages.FLIP_CARD_CREATED_SUCCESS,
        data: newFlipCard,
      };
    } catch (error: any) {
      // Handle duplicate key error (unique index on skillId + jobId)
      // This should not happen as the unique index is automatically dropped on server startup
      if (error.code === 11000 && error.keyPattern) {
        const duplicateFields = Object.keys(error.keyPattern).join(', ');
        return {
          success: false,
          message: `Database constraint violation: A unique index still exists on ${duplicateFields}. Please restart the server to automatically remove it.`,
          data: null,
        };
      }
      throw error;
    }
  }

  public async getFlipCardsByJob(jobId: string): Promise<ServiceResponse> {
    const flipCards = await this.flipCardRepository.findByJobId(jobId);
    return {
      success: true,
      message: Messages.FLIP_CARD_FETCH_SUCCESS,
      data: flipCards,
    };
  }

  public async updateFlipCard(id: string, data: Partial<IFlipCard>): Promise<ServiceResponse> {
    // Validate that correctAnswer exists in options array if both are provided
    if (data.options && data.correctAnswer && !data.options.includes(data.correctAnswer)) {
      return {
        success: false,
        message: 'Correct answer must be one of the provided options',
        data: null,
      };
    }

    const existingCard = await this.flipCardRepository.findById(id);
    if (!existingCard) {
      return {
        success: false,
        message: Messages.FLIP_CARD_NOT_FOUND,
        data: null,
      };
    }

    const updatedFlipCard = await this.flipCardRepository.update(id, data);
    
    // Populate skillId to match the fetch response format
    if (updatedFlipCard) {
      await updatedFlipCard.populate('skillId', 'name _id');
    }
    
    return {
      success: true,
      message: Messages.FLIP_CARD_UPDATED_SUCCESS,
      data: updatedFlipCard,
    };
  }

  public async deleteFlipCard(id: string): Promise<ServiceResponse> {
    const existingCard = await this.flipCardRepository.findById(id);
    if (!existingCard) {
      return {
        success: false,
        message: Messages.FLIP_CARD_NOT_FOUND,
        data: null,
      };
    }

    await this.flipCardRepository.delete(id);
    return {
      success: true,
      message: Messages.FLIP_CARD_DELETED_SUCCESS,
      data: null,
    };
  }

  public async createBatchFlipCards(data: IFlipCard[]): Promise<ServiceResponse> {
    // Validate all flip cards before creating
    const validationErrors: string[] = [];
    data.forEach((card, index) => {
      if (!card.options.includes(card.correctAnswer)) {
        validationErrors.push(`Card ${index + 1}: Correct answer must be one of the provided options`);
      }
    });

    if (validationErrors.length > 0) {
      return {
        success: false,
        message: validationErrors.join('; '),
        data: null,
      };
    }

    try {
      const newFlipCards = await this.flipCardRepository.createMany(data);
      
      // Populate skillId for all cards
      if (newFlipCards && newFlipCards.length > 0) {
        await Promise.all(
          newFlipCards.map(card => card.populate('skillId', 'name _id'))
        );
      }
      
      return {
        success: true,
        message: `Successfully created ${newFlipCards.length} flip card(s)`,
        data: newFlipCards,
      };
    } catch (error: any) {
      // Handle duplicate key errors
      if (error.code === 11000 && error.keyPattern) {
        const duplicateFields = Object.keys(error.keyPattern).join(', ');
        return {
          success: false,
          message: `Database constraint violation: A unique index still exists on ${duplicateFields}. Please restart the server to automatically remove it.`,
          data: null,
        };
      }
      
      // Handle bulk write errors (for partial failures)
      if (error.writeErrors && error.writeErrors.length > 0) {
        const errorMessages = error.writeErrors.map((err: any) => err.errmsg).join('; ');
        return {
          success: false,
          message: `Some flip cards failed to create: ${errorMessages}`,
          data: null,
        };
      }
      
      throw error;
    }
  }
}

