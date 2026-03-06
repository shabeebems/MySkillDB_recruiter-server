import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { EmailHrService } from "../services/emailHr.service";

export class EmailHrController {
  private emailHrService = new EmailHrService();

  public createEmailHr = (req: any, res: Response): Promise<void> => {
    const organizationId = req.user?.organizationId?.toString();
    const { name, email, companyName, destination, jobId } = req.body;

    if (!organizationId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Organization ID not found. Please ensure you are associated with an organization.",
          data: null,
        })
      );
    }

    if (!name || !email || !companyName || !destination || !jobId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "All fields are required: name, email, companyName, destination, and jobId.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.emailHrService.createEmailHr(
        name,
        email,
        companyName,
        destination,
        jobId,
        organizationId
      )
    );
  };

  public getEmailHrByOrganization = (req: any, res: Response): Promise<void> => {
    const organizationId = req.user?.organizationId?.toString();

    if (!organizationId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Organization ID not found. Please ensure you are associated with an organization.",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.emailHrService.getEmailHrByOrganization(organizationId)
    );
  };

  public getEmailHrWithStudents = (req: any, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Email HR ID is required",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.emailHrService.getEmailHrWithStudents(id)
    );
  };

  public getStudentCVData = (req: any, res: Response): Promise<void> => {
    const { studentId } = req.params;
    const { jobId, organizationId } = req.query;

    if (!studentId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Student ID is required",
          data: null,
        })
      );
    }

    if (!jobId || !organizationId) {
      return handleRequest(
        res,
        async () => ({
          success: false,
          message: "Job ID and Organization ID are required",
          data: null,
        })
      );
    }

    return handleRequest(
      res,
      () => this.emailHrService.getStudentCVData(studentId, jobId as string, organizationId as string)
    );
  };
}

