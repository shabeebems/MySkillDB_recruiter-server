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

  private getTargetUserId(req: any): string {
    if (req.user?.role === "org_admin" && req.query.userId) {
      return req.query.userId as string;
    }
    return req.user._id.toString();
  }

  // Profile methods
  public getCVProfile = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProfileService.getCVProfileByUserId(this.getTargetUserId(req))
    );

  public createOrUpdateCVProfile = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProfileService.createOrUpdateCVProfile(
        this.getTargetUserId(req),
        req.body
      )
    );

  // Style preferences (font, color, size)
  public getStylePreferences = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvStylePreferenceService.getByUserId(this.getTargetUserId(req))
    );

  public createOrUpdateStylePreferences = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvStylePreferenceService.createOrUpdate(
        this.getTargetUserId(req),
        req.body
      )
    );

  // Education methods
  public getCVEducation = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.getCVEducationByUserId(this.getTargetUserId(req))
    );

  public createCVEducation = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.createCVEducation(
        this.getTargetUserId(req),
        req.body
      )
    );

  public updateCVEducation = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.updateCVEducation(
        req.params.id,
        req.body,
        this.getTargetUserId(req)
      )
    );

  public deleteCVEducation = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvEducationService.deleteCVEducation(
        req.params.id,
        this.getTargetUserId(req)
      )
    );

  // Experience methods
  public getCVExperience = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.getCVExperienceByUserId(this.getTargetUserId(req))
    );

  public createCVExperience = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.createCVExperience(
        this.getTargetUserId(req),
        req.body
      )
    );

  public updateCVExperience = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.updateCVExperience(
        req.params.id,
        req.body,
        this.getTargetUserId(req)
      )
    );

  public deleteCVExperience = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvExperienceService.deleteCVExperience(
        req.params.id,
        this.getTargetUserId(req)
      )
    );

  // Project methods
  public getCVProject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.getCVProjectByUserId(this.getTargetUserId(req))
    );

  public createCVProject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.createCVProject(
        this.getTargetUserId(req),
        req.body
      )
    );

  public updateCVProject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.updateCVProject(
        req.params.id,
        req.body,
        this.getTargetUserId(req)
      )
    );

  public deleteCVProject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvProjectService.deleteCVProject(
        req.params.id,
        this.getTargetUserId(req)
      )
    );

  // Certificate methods
  public getCVCertificate = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.getCVCertificateByUserId(this.getTargetUserId(req))
    );

  public createCVCertificate = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.createCVCertificate(
        this.getTargetUserId(req),
        req.body
      )
    );

  public updateCVCertificate = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.updateCVCertificate(
        req.params.id,
        req.body,
        this.getTargetUserId(req)
      )
    );

  public deleteCVCertificate = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.cvCertificateService.deleteCVCertificate(
        req.params.id,
        this.getTargetUserId(req)
      )
    );
}

