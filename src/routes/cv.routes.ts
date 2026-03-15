import { Router } from "express";
import { CVController } from "../controller/cv.controller";
import { authenticateToken } from "../middlewares/tokenValidation";
import { validate } from "../middlewares/zodValidate";
import { createOrUpdateCVProfileSchema } from "../schemas/cvProfile.schema";
import {
  createCVEducationSchema,
  updateCVEducationSchema,
} from "../schemas/cvEducation.schema";
import {
  createCVExperienceSchema,
  updateCVExperienceSchema,
} from "../schemas/cvExperience.schema";
import {
  createCVProjectSchema,
  updateCVProjectSchema,
} from "../schemas/cvProject.schema";
import {
  createCVCertificateSchema,
  updateCVCertificateSchema,
} from "../schemas/cvCertificate.schema";
import { createOrUpdateCvStylePreferenceSchema } from "../schemas/cvStylePreference.schema";

const cvRouter: Router = Router();
const cvController = new CVController();

cvRouter.use(authenticateToken(["student", "org_admin"]));

// Profile routes
cvRouter.get("/profile", cvController.getCVProfile);
cvRouter.post(
  "/profile",
  validate(createOrUpdateCVProfileSchema),
  cvController.createOrUpdateCVProfile
);
cvRouter.put(
  "/profile",
  validate(createOrUpdateCVProfileSchema.partial()),
  cvController.createOrUpdateCVProfile
);

// Style preferences (font, color, font size)
cvRouter.get("/style-preferences", cvController.getStylePreferences);
cvRouter.put(
  "/style-preferences",
  validate(createOrUpdateCvStylePreferenceSchema),
  cvController.createOrUpdateStylePreferences
);

// Education routes
cvRouter.get("/education", cvController.getCVEducation);
cvRouter.post(
  "/education",
  validate(createCVEducationSchema),
  cvController.createCVEducation
);
cvRouter.put(
  "/education/:id",
  validate(updateCVEducationSchema),
  cvController.updateCVEducation
);
cvRouter.delete("/education/:id", cvController.deleteCVEducation);

// Experience routes
cvRouter.get("/experience", cvController.getCVExperience);
cvRouter.post(
  "/experience",
  validate(createCVExperienceSchema),
  cvController.createCVExperience
);
cvRouter.put(
  "/experience/:id",
  validate(updateCVExperienceSchema),
  cvController.updateCVExperience
);
cvRouter.delete("/experience/:id", cvController.deleteCVExperience);

// Project routes
cvRouter.get("/project", cvController.getCVProject);
cvRouter.post(
  "/project",
  validate(createCVProjectSchema),
  cvController.createCVProject
);
cvRouter.put(
  "/project/:id",
  validate(updateCVProjectSchema),
  cvController.updateCVProject
);
cvRouter.delete("/project/:id", cvController.deleteCVProject);

// Certificate routes
cvRouter.get("/certificate", cvController.getCVCertificate);
cvRouter.post(
  "/certificate",
  validate(createCVCertificateSchema),
  cvController.createCVCertificate
);
cvRouter.put(
  "/certificate/:id",
  validate(updateCVCertificateSchema),
  cvController.updateCVCertificate
);
cvRouter.delete("/certificate/:id", cvController.deleteCVCertificate);

export default cvRouter;

