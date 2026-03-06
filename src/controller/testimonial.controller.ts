import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { TestimonialService } from "../services/testimonial.service";

export class TestimonialController {
  private testimonialService = new TestimonialService();

  public createTestimonial = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.testimonialService.createTestimonial((req as any).user?._id, req.body)
    );

  public getTestimonials = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.testimonialService.getTestimonialsByUserJobAndSkill(
        (req as any).user?._id,
        req.query.jobId as string,
        req.query.skillId as string
      )
    );

  public getTestimonialsByStudent = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.testimonialService.getTestimonialsByUserId((req as any).user?._id)
    );

  public deleteTestimonial = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.testimonialService.deleteTestimonial(req.params.id, (req as any).user?._id)
    );
}

