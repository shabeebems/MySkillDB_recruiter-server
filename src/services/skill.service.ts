import { SkillRepository } from "../repositories/skill.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { ISkill } from "../models/skill.model";
import { formatSkillsOutput } from "../views/skill.view";
import { Types } from "mongoose";

export class SkillService {
  private skillRepository = new SkillRepository();

  public async createSkill(data: ISkill): Promise<ServiceResponse> {
    // Check if skill with same name, jobId, and type already exists
    const existingSkill = await this.skillRepository.findByNameAndJobIdAndType(
      data.name,
      String(data.jobId),
      data.type
    );

    if (existingSkill) {
      return {
        success: false,
        message: Messages.SKILL_ALREADY_EXISTS,
        data: null,
      };
    }

    const newSkill = await this.skillRepository.create(data);
    return {
      success: true,
      message: Messages.SKILL_CREATED_SUCCESS,
      data: newSkill,
    };
  }

  public async getSkillsByJob(jobId: string): Promise<ServiceResponse> {
    // Validate if jobId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(jobId)) {
      return {
        success: true,
        message: Messages.SKILL_FETCH_SUCCESS,
        data: [], // Return empty array for invalid ObjectIds (dummy/test data)
      };
    }

    const skills = await this.skillRepository.findByJobId(jobId);
    return {
      success: true,
      message: Messages.SKILL_FETCH_SUCCESS,
      data: formatSkillsOutput(skills),
    };
  }

  public async getSkillsByJobAndType(jobId: string, type: string): Promise<ServiceResponse> {
    // Validate if jobId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(jobId)) {
      return {
        success: true,
        message: Messages.SKILL_FETCH_SUCCESS,
        data: [], // Return empty array for invalid ObjectIds (dummy/test data)
      };
    }

    const skills = await this.skillRepository.findByJobIdAndType(jobId, type);
    return {
      success: true,
      message: Messages.SKILL_FETCH_SUCCESS,
      data: formatSkillsOutput(skills),
    };
  }

  public async getSkillById(skillId: string): Promise<ServiceResponse> {
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      return {
        success: false,
        message: Messages.SKILL_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      message: Messages.SKILL_FETCH_SINGLE_SUCCESS,
      data: skill,
    };
  }

  public async updateSkill(skillId: string, data: Partial<ISkill>): Promise<ServiceResponse> {
    // Check if skill exists
    const existingSkill = await this.skillRepository.findById(skillId);
    if (!existingSkill) {
      return {
        success: false,
        message: Messages.SKILL_NOT_FOUND,
        data: null,
      };
    }

    // If name or type is being changed, check for duplicates
    if ((data.name && data.name !== existingSkill.name) || 
        (data.type && data.type !== existingSkill.type)) {
      const jobId = data.jobId || existingSkill.jobId;
      const name = data.name || existingSkill.name;
      const type = data.type || existingSkill.type;
      
      const duplicateSkill = await this.skillRepository.findByNameAndJobIdAndType(
        name,
        String(jobId),
        type
      );

      if (duplicateSkill && String(duplicateSkill._id) !== skillId) {
        return {
          success: false,
          message: Messages.SKILL_ALREADY_EXISTS,
          data: null,
        };
      }
    }

    const updatedSkill = await this.skillRepository.update(skillId, data);
    return {
      success: true,
      message: Messages.SKILL_UPDATED_SUCCESS,
      data: updatedSkill,
    };
  }

  public async deleteSkill(skillId: string): Promise<ServiceResponse> {
    const deletedSkill = await this.skillRepository.delete(skillId);
    
    if (!deletedSkill) {
      return {
        success: false,
        message: Messages.SKILL_NOT_FOUND,
        data: null,
      };
    }

    return {
      success: true,
      message: Messages.SKILL_DELETED_SUCCESS,
      data: deletedSkill,
    };
  }
}

