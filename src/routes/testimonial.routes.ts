import { Router } from "express";
import { TestimonialController } from "../controller/testimonial.controller";
import { authenticateToken } from "../middlewares/tokenValidation";

const testimonialRouter: Router = Router();
const testimonialController = new TestimonialController();

testimonialRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

testimonialRouter.post("/", testimonialController.createTestimonial);
testimonialRouter.get("/", testimonialController.getTestimonials);
testimonialRouter.get("/student/all", testimonialController.getTestimonialsByStudent);
testimonialRouter.delete("/:id", testimonialController.deleteTestimonial);

export default testimonialRouter;

