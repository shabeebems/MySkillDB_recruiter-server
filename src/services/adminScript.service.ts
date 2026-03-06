import {
  AdminScriptRepository,
  AdminScriptSectionRepository,
} from "../repositories/adminScript.repository";
import { ServiceResponse } from "./types";
import { IAdminScript } from "../models/adminScript.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("AdminScriptService");


export class AdminScriptService {
  private adminScriptRepository = new AdminScriptRepository();
  private sectionRepository = new AdminScriptSectionRepository();

  public async getById(adminScriptId: string): Promise<IAdminScript | null> {
    return this.adminScriptRepository.findById(adminScriptId);
  }

  public async getByOrganizationId(organizationId: string, jobId?: string): Promise<ServiceResponse> {
    if (!organizationId) {
      return {
        success: false,
        message: "organizationId is required",
        data: null,
      };
    }
    try {
      const scripts = await this.adminScriptRepository.findByOrganizationId(organizationId, jobId);
      return {
        success: true,
        message: "Admin scripts fetched successfully",
        data: scripts,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching admin scripts:");
      return {
        success: false,
        message: "Failed to fetch admin scripts",
        data: null,
      };
    }
  }

  public async getSections(adminScriptId: string): Promise<ServiceResponse> {
    if (!adminScriptId) {
      return {
        success: false,
        message: "adminScriptId is required",
        data: null,
      };
    }
    try {
      const sections = await this.sectionRepository.findByAdminScriptId(adminScriptId);
      return {
        success: true,
        message: "Sections fetched successfully",
        data: sections.map((s) => ({
          time: s.time,
          title: s.title,
          content: s.content,
          order: s.order,
        })),
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching script sections:");
      return {
        success: false,
        message: "Failed to fetch sections",
        data: null,
      };
    }
  }

  public async createFromGenerated(payload: {
    organizationId: string;
    createdBy?: string;
    scriptType: "job_overview" | "content";
    jobId?: string;
    title: string;
    selectedLength: string;
    userIdea?: string;
    sections: Array<{ timestamp?: string; section?: string; script?: string; time?: string; title?: string; content?: string }>;
  }): Promise<ServiceResponse> {
    const {
      organizationId,
      createdBy,
      scriptType,
      jobId,
      title,
      selectedLength,
      userIdea,
      sections,
    } = payload;
    if (!organizationId || !title || !sections?.length) {
      return {
        success: false,
        message: "organizationId, title, and sections are required",
        data: null,
      };
    }
    if (jobId) {
      const exists = await this.adminScriptRepository.existsByOrganizationIdAndJobId(organizationId, jobId);
      if (exists) {
        return {
          success: false,
          message: "Only one admin script is allowed per job. Delete the existing script or use Regenerate.",
          data: null,
        };
      }
    }
    try {
      const normalizedSections = sections.map((s, i) => ({
        time: s.timestamp || s.time || "",
        title: s.section || s.title || "",
        content: s.script || s.content || "",
        order: i,
      }));
      const script = await this.adminScriptRepository.createWithSections(
        {
          organizationId: organizationId as any,
          createdBy: createdBy as any,
          scriptType,
          jobId: jobId as any,
          title,
          selectedLength,
          userIdea,
        },
        normalizedSections
      );
      return {
        success: true,
        message: "Script created successfully",
        data: script,
      };
    } catch (error) {
      log.error({ err: error }, "Error creating admin script:");
      return {
        success: false,
        message: "Failed to create script",
        data: null,
      };
    }
  }

  public async deleteAdminScript(
    adminScriptId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    if (!adminScriptId || !organizationId) {
      return {
        success: false,
        message: "adminScriptId and organizationId are required",
        data: null,
      };
    }
    try {
      const script = await this.adminScriptRepository.findById(adminScriptId);
      if (!script) {
        return { success: false, message: "Script not found", data: null };
      }
      if (String(script.organizationId) !== organizationId) {
        return { success: false, message: "Not authorized to delete this script", data: null };
      }
      await this.sectionRepository.deleteByAdminScriptId(adminScriptId);
      await this.adminScriptRepository.delete(adminScriptId);
      return { success: true, message: "Script deleted successfully", data: null };
    } catch (error) {
      log.error({ err: error }, "Error deleting admin script:");
      return {
        success: false,
        message: "Failed to delete script",
        data: null,
      };
    }
  }
}
