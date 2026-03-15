import { Types } from "mongoose";
import { CVCertificateRepository } from "../../repositories/cvCertificate.repository";
import { Messages } from "../../constants/messages";
import { ServiceResponse } from "../types";
import { ICVCertificate } from "../../models/cvCertificate.model";

export class CVCertificateService {
  private cvCertificateRepository = new CVCertificateRepository();

  public async getCVCertificateByUserId(userId: string): Promise<ServiceResponse> {
    const certificates = await this.cvCertificateRepository.findByUserId(userId);
    return {
      success: true,
      message: Messages.CV_CERTIFICATE_FETCH_SUCCESS,
      data: certificates,
    };
  }

  public async createCVCertificate(
    userId: string,
    data: Partial<ICVCertificate>
  ): Promise<ServiceResponse> {
    const newCertificate = await this.cvCertificateRepository.create({
      userId: new Types.ObjectId(userId) as any,
      ...data,
    });
    return {
      success: true,
      message: Messages.CV_CERTIFICATE_CREATED_SUCCESS,
      data: newCertificate,
    };
  }

  public async updateCVCertificate(
    id: string,
    data: Partial<ICVCertificate>,
    targetUserId?: string
  ): Promise<ServiceResponse> {
    if (targetUserId) {
      const existing = await this.cvCertificateRepository.findById(id);
      if (!existing || (existing as any).userId?.toString() !== targetUserId) {
        return {
          success: false,
          message: Messages.CV_CERTIFICATE_NOT_FOUND,
          data: null,
        };
      }
    }
    const updatedCertificate = await this.cvCertificateRepository.update(id, data);
    if (!updatedCertificate) {
      return {
        success: false,
        message: Messages.CV_CERTIFICATE_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_CERTIFICATE_UPDATED_SUCCESS,
      data: updatedCertificate,
    };
  }

  public async deleteCVCertificate(id: string, targetUserId?: string): Promise<ServiceResponse> {
    if (targetUserId) {
      const existing = await this.cvCertificateRepository.findById(id);
      if (!existing || (existing as any).userId?.toString() !== targetUserId) {
        return {
          success: false,
          message: Messages.CV_CERTIFICATE_NOT_FOUND,
          data: null,
        };
      }
    }
    const deletedCertificate = await this.cvCertificateRepository.delete(id);
    if (!deletedCertificate) {
      return {
        success: false,
        message: Messages.CV_CERTIFICATE_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.CV_CERTIFICATE_DELETED_SUCCESS,
      data: deletedCertificate,
    };
  }
}

