import { TopicRepository } from "../repositories/topic.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { ITopic } from "../models/topic.model";
import { formatTopicsOutput } from "../views/topic.view";

export class TopicService {
  private topicRepository = new TopicRepository();

  public async createTopic(data: ITopic): Promise<ServiceResponse> {
    if (!data.subjectId) {
      return {
        success: false,
        message: "Subject ID is required for topics",
        data: null,
      };
    }

    const existingTopic = await this.topicRepository.findByNameAndSubjectId(
      data.name, 
      String(data.subjectId)
    );

    if (existingTopic) {
      return {
        success: false,
        message: Messages.TOPIC_ALREADY_EXISTS,
        data: null,
      };
    }

    const newTopic = await this.topicRepository.create(data);
    return {
      success: true,
      message: Messages.TOPIC_CREATED_SUCCESS,
      data: newTopic,
    };
  }

  public async getTopicsBySubject(subjectId: string): Promise<ServiceResponse> {
    const topics = await this.topicRepository.findBySubjectId(subjectId);
    return {
      success: true,
      message: Messages.TOPIC_FETCH_SUCCESS,
      data: formatTopicsOutput(topics),
    };
  }

  public async getTopicById(topicId: string): Promise<ServiceResponse> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) {
      return {
        success: false,
        message: Messages.TOPIC_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.TOPIC_FETCH_SUCCESS,
      data: topic,
    };
  }

  public async updateTopic(topicId: string, data: Partial<ITopic>): Promise<ServiceResponse> {
    // Check if topic exists
    const existingTopic = await this.topicRepository.findById(topicId);
    if (!existingTopic) {
      return {
        success: false,
        message: Messages.TOPIC_NOT_FOUND,
        data: null,
      };
    }

    // If name is being changed, check for duplicates
    if (data.name && data.name !== existingTopic.name) {
      const subjectId = data.subjectId || existingTopic.subjectId;
      if (!subjectId) {
        return {
          success: false,
          message: "Subject ID is required",
          data: null,
        };
      }

      const duplicateTopic = await this.topicRepository.findByNameAndSubjectId(
        data.name, 
        String(subjectId)
      );

      if (duplicateTopic && String(duplicateTopic._id) !== topicId) {
        return {
          success: false,
          message: Messages.TOPIC_ALREADY_EXISTS,
          data: null,
        };
      }
    }

    const updatedTopic = await this.topicRepository.update(topicId, data);
    return {
      success: true,
      message: Messages.TOPIC_UPDATED_SUCCESS,
      data: updatedTopic,
    };
  }

  public async deleteTopic(topicId: string): Promise<ServiceResponse> {
    const deletedTopic = await this.topicRepository.delete(topicId);
    
    if (!deletedTopic) {
      return {
        success: false,
        message: Messages.TOPIC_NOT_FOUND,
        data: null,
      };
    }

    return {
      success: true,
      message: Messages.TOPIC_DELETED_SUCCESS,
      data: deletedTopic,
    };
  }

  public async createBatchTopics(data: ITopic[]): Promise<ServiceResponse> {
    if (!data || data.length === 0) {
      return {
        success: false,
        message: "At least one topic is required",
        data: null,
      };
    }

    // Validate all topics have required fields
    const validationErrors: string[] = [];
    data.forEach((topic, index) => {
      if (!topic.subjectId) {
        validationErrors.push(`Topic ${index + 1}: Subject ID is required`);
      }
      if (!topic.name || !topic.name.trim()) {
        validationErrors.push(`Topic ${index + 1}: Name is required`);
      }
      if (!topic.organizationId) {
        validationErrors.push(`Topic ${index + 1}: Organization ID is required`);
      }
    });

    if (validationErrors.length > 0) {
      return {
        success: false,
        message: validationErrors.join('; '),
        data: null,
      };
    }

    // Check for duplicates within the batch
    const topicNamesInBatch = new Set<string>();
    const duplicateInBatch: string[] = [];
    data.forEach((topic, index) => {
      const key = `${topic.name.toLowerCase()}_${topic.subjectId}`;
      if (topicNamesInBatch.has(key)) {
        duplicateInBatch.push(`Topic ${index + 1}: "${topic.name}"`);
      } else {
        topicNamesInBatch.add(key);
      }
    });

    if (duplicateInBatch.length > 0) {
      return {
        success: false,
        message: `Duplicate topics in batch: ${duplicateInBatch.join(', ')}`,
        data: null,
      };
    }

    // Check for duplicates against existing topics in database
    const existingTopics: ITopic[] = [];
    for (const topic of data) {
      const existing = await this.topicRepository.findByNameAndSubjectId(
        topic.name,
        String(topic.subjectId)
      );
      if (existing) {
        existingTopics.push(existing);
      }
    }

    if (existingTopics.length > 0) {
      const duplicateNames = existingTopics.map(t => `"${t.name}"`).join(', ');
      return {
        success: false,
        message: `Topics already exist: ${duplicateNames}. Please remove duplicates and try again.`,
        data: null,
      };
    }

    try {
      const newTopics = await this.topicRepository.createMany(data);
      
      return {
        success: true,
        message: Messages.TOPIC_BATCH_CREATED_SUCCESS,
        data: formatTopicsOutput(newTopics),
      };
    } catch (error: any) {
      // Handle duplicate key errors
      if (error.code === 11000) {
        return {
          success: false,
          message: "Some topics already exist. Please check for duplicates and try again.",
          data: null,
        };
      }
      
      // Handle bulk write errors (for partial failures)
      if (error.writeErrors && error.writeErrors.length > 0) {
        const errorMessages = error.writeErrors.map((err: any) => err.errmsg).join('; ');
        return {
          success: false,
          message: `Some topics failed to create: ${errorMessages}`,
          data: null,
        };
      }
      
      throw error;
    }
  }
}
