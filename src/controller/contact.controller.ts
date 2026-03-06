import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { ContactService } from "../services/contact.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id?: string;
    [key: string]: unknown;
  };
}

export class ContactController {
  private contactService = new ContactService();

  public createContact = (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> =>
    handleRequest(res, () => {
      const userId = req.user?._id;
      if (!userId) {
        throw new Error("User ID not found");
      }
      return this.contactService.createContact({ ...req.body, userId });
    });

  public getContactsByDesig = (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> =>
    handleRequest(res, () => {
      const userId = req.user?._id;
      const designation = req.params.designation;
      if (!userId) {
        throw new Error("User ID not found");
      }
      if (!designation) {
        throw new Error("Designation not found");
      }
      return this.contactService.getContactsByDesig(userId, designation);
    });

  public getAllContacts = (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> =>
    handleRequest(res, () => {
      const userId = req.user?._id;
      if (!userId) {
        throw new Error("User ID not found");
      }
      return this.contactService.getAllContacts(userId);
    });
}
