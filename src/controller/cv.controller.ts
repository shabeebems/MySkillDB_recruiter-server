import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { CVProfileService } from "../services/cv/cvProfile.service";
import { CVEducationService } from "../services/cv/cvEducation.service";
import { CVExperienceService } from "../services/cv/cvExperience.service";
import { CVProjectService } from "../services/cv/cvProject.service";
import { CVCertificateService } from "../services/cv/cvCertificate.service";
import { CvStylePreferenceService } from "../services/cv/cvStylePreference.service";

export class CVController {
  private cvProfileService = new CVProfileService();
  private cvEducationService = new CVEducationService();
  private cvExperienceService = new CVExperienceService();
  private cvProjectService = new CVProjectService();
  private cvCertificateService = new CVCertificateService();
  private cvStylePreferenceService = new CvStylePreferenceService();

  // Profile methods
  public getCVProfile = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProfileService.getCVProfileByUserId(req.user._id.toString())
    );

  public createOrUpdateCVProfile = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProfileService.createOrUpdateCVProfile(
        req.user._id.toString(),
        req.body
      )
    );

  // Style preferences (font, color, size)
  public getStylePreferences = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvStylePreferenceService.getByUserId(req.user._id.toString())
    );

  public createOrUpdateStylePreferences = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvStylePreferenceService.createOrUpdate(
        req.user._id.toString(),
        req.body
      )
    );

  // Education methods
  public getCVEducation = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.getCVEducationByUserId(req.user._id.toString())
    );

  public createCVEducation = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.createCVEducation(
        req.user._id.toString(),
        req.body
      )
    );

  public updateCVEducation = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.updateCVEducation(req.params.id, req.body)
    );

  public deleteCVEducation = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.deleteCVEducation(req.params.id)
    );

  // Experience methods
  public getCVExperience = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.getCVExperienceByUserId(req.user._id.toString())
    );

  public createCVExperience = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.createCVExperience(
        req.user._id.toString(),
        req.body
      )
    );

  public updateCVExperience = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.updateCVExperience(req.params.id, req.body)
    );

  public deleteCVExperience = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.deleteCVExperience(req.params.id)
    );

  // Project methods
  public getCVProject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.getCVProjectByUserId(req.user._id.toString())
    );

  public createCVProject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.createCVProject(
        req.user._id.toString(),
        req.body
      )
    );

  public updateCVProject = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.updateCVProject(req.params.id, req.body)
    );

  public deleteCVProject = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.deleteCVProject(req.params.id)
    );

  // Certificate methods
  public getCVCertificate = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.getCVCertificateByUserId(req.user._id.toString())
    );

  public createCVCertificate = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.createCVCertificate(
        req.user._id.toString(),
        req.body
      )
    );

  public updateCVCertificate = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.updateCVCertificate(req.params.id, req.body)
    );

  public deleteCVCertificate = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.deleteCVCertificate(req.params.id)
    );
}

