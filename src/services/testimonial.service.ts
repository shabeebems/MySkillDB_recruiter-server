import { Types } from "mongoose";
import { TestimonialRepository } from "../repositories/testimonial.repository";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { ITestimonial } from "../models/testimonial.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("TestimonialService");


export class TestimonialService {
  private testimonialRepository = new TestimonialRepository();

  public async createTestimonial(
    userId: string | undefined,
    data: {
      jobId: string;
      skillId: string;
      validatorName: string;
      validatorEmail: string;
      validatorRole: string;
    }
  ): Promise<ServiceResponse> {
    if (!userId || !data.jobId || !data.skillId || !data.validatorName || !data.validatorEmail || !data.validatorRole) {
      return {
        success: false,
        message: "userId, jobId, skillId, validatorName, validatorEmail, and validatorRole are required",
        data: null,
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.validatorEmail.trim())) {
      return {
        success: false,
        message: "Please enter a valid email address",
        data: null,
      };
    }

    try {
      // Create testimonial
      const testimonial = await this.testimonialRepository.create({
        userId: new Types.ObjectId(userId) as any,
        jobId: new Types.ObjectId(data.jobId) as any,
        skillId: new Types.ObjectId(data.skillId) as any,
        validatorName: data.validatorName.trim(),
        validatorEmail: data.validatorEmail.trim(),
        validatorRole: data.validatorRole.trim(),
      } as Partial<ITestimonial>);

      return {
        success: true,
        message: Messages.TESTIMONIAL_CREATED_SUCCESS || "Testimonial created successfully",
        data: testimonial,
      };
    } catch (error) {
      log.error({ err: error }, "Error creating testimonial:");
      return {
        success: false,
        message: "Failed to create testimonial",
        data: null,
      };
    }
  }

  public async getTestimonialsByUserJobAndSkill(
    userId: string | undefined,
    jobId: string,
    skillId: string
  ): Promise<ServiceResponse> {
    if (!userId || !jobId || !skillId) {
      return {
        success: false,
        message: "userId, jobId and skillId are required",
        data: null,
      };
    }

    try {
      const testimonials = await this.testimonialRepository.findByUserAndJobAndSkill(
        userId,
        jobId,
        skillId
      );

      return {
        success: true,
        message: Messages.TESTIMONIAL_FETCH_SUCCESS || "Testimonials fetched successfully",
        data: testimonials,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching testimonials:");
      return {
        success: false,
        message: "Failed to fetch testimonials",
        data: null,
      };
    }
  }

  public async getTestimonialsByUserId(userId: string): Promise<ServiceResponse> {
    if (!userId) {
      return {
        success: false,
        message: "userId is required",
        data: null,
      };
    }

    try {
      const testimonials = await this.testimonialRepository.findByUserId(userId);
      return {
        success: true,
        message: Messages.TESTIMONIAL_FETCH_SUCCESS || "Testimonials fetched successfully",
        data: testimonials,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching testimonials by student:");
      return {
        success: false,
        message: "Failed to fetch testimonials",
        data: null,
      };
    }
  }

  public async deleteTestimonial(testimonialId: string, userId: string | undefined): Promise<ServiceResponse> {
    if (!testimonialId) {
      return {
        success: false,
        message: "testimonialId is required",
        data: null,
      };
    }

    try {
      // Verify the testimonial belongs to the student
      const testimonial = await this.testimonialRepository.findById(testimonialId);
      if (!testimonial) {
        return {
          success: false,
          message: "Testimonial not found",
          data: null,
        };
      }

      // Check if user owns this testimonial
      if (userId && String(testimonial.userId) !== String(userId)) {
        return {
          success: false,
          message: "You don't have permission to delete this testimonial",
          data: null,
        };
      }

      // Delete the testimonial
      const deleted = await this.testimonialRepository.delete(testimonialId);
      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete testimonial",
          data: null,
        };
      }

      return {
        success: true,
        message: "Testimonial deleted successfully",
        data: deleted,
      };
    } catch (error) {
      log.error({ err: error }, "Error deleting testimonial:");
      return {
        success: false,
        message: "Failed to delete testimonial",
        data: null,
      };
    }
  }
}

