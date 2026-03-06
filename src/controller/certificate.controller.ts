import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { CertificateService } from "../services/certificate.service";

export class CertificateController {
  private certificateService = new CertificateService();

  public createCertificate = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.certificateService.createCertificate((req as any).user?._id, req.body)
    );

  public getCertificates = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.certificateService.getCertificatesByStudentJobAndSkill(
        (req as any).user?._id,
        req.query.jobId as string,
        req.query.skillId as string
      )
    );

  public getCertificatesByStudent = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.certificateService.getCertificatesByUserId((req as any).user?._id)
    );

  public deleteCertificate = (req: Request, res: Response): Promise<void> =>
    handleRequest(
      res,
      () => this.certificateService.deleteCertificate(req.params.id, (req as any).user?._id)
    );
}

