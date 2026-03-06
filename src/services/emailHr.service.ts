import { EmailHrRepository } from "../repositories/emailHr.repository";
import { ServiceResponse } from "./types";
import { Types } from "mongoose";
import { IEmailHr } from "../models/emailHr.model";
import EmailHrModel from "../models/emailHr.model";
import JobApplicationModel from "../models/jobApplication.model";
import { CVProfileService } from "./cv/cvProfile.service";
import { CVEducationService } from "./cv/cvEducation.service";
import { CVExperienceService } from "./cv/cvExperience.service";
import { CVProjectService } from "./cv/cvProject.service";
import { CVCertificateService } from "./cv/cvCertificate.service";
import { SkillService } from "./skill.service";
import { StudentTestHistoryService } from "./studentTestHistory.service";
import { TestimonialService } from "./testimonial.service";
import { CertificateService } from "./certificate.service";
import { StudentVideoService } from "./studentVideo.service";
import InterviewPlannerModel from "../models/interviewPlanner.model";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("EmailHrService");


export class EmailHrService {
  private emailHrRepository = new EmailHrRepository();
  private cvProfileService = new CVProfileService();
  private cvEducationService = new CVEducationService();
  private cvExperienceService = new CVExperienceService();
  private cvProjectService = new CVProjectService();
  private cvCertificateService = new CVCertificateService();
  private skillService = new SkillService();
  private studentTestHistoryService = new StudentTestHistoryService();
  private testimonialService = new TestimonialService();
  private certificateService = new CertificateService();
  private studentVideoService = new StudentVideoService();

  public async createEmailHr(
    name: string,
    email: string,
    companyName: string,
    destination: string,
    jobId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectIds
      new Types.ObjectId(jobId);
      new Types.ObjectId(organizationId);

      // Create new email HR record
      const emailHrData: Partial<IEmailHr> = {
        name,
        email,
        companyName,
        destination,
        jobId: jobId as any,
        organizationId: organizationId as any,
      };

      const emailHr = await this.emailHrRepository.create(emailHrData);

      return {
        success: true,
        message: "Email HR record created successfully",
        data: emailHr.toObject(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create email HR record",
        data: null,
      };
    }
  }

  public async getEmailHrByOrganization(
    organizationId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectId
      new Types.ObjectId(organizationId);

      // Find all email HR records for the organization and populate job details
      const populatedRecords = await EmailHrModel
        .find({ organizationId: organizationId as any })
        .populate("jobId", "name title")
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        message: "Email HR records fetched successfully",
        data: populatedRecords,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch email HR records",
        data: null,
      };
    }
  }

  public async getEmailHrWithStudents(
    emailHrId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectId
      new Types.ObjectId(emailHrId);

      // Find email HR record and populate job details and organization name
      const emailHr = await EmailHrModel
        .findById(emailHrId)
        .populate("jobId", "name companyName")
        .populate("organizationId", "name")
        .lean();

      if (!emailHr) {
        return {
          success: false,
          message: "Email HR record not found",
          data: null,
        };
      }

      // Get the jobId (could be ObjectId or populated object)
      const jobIdValue = (emailHr.jobId as any)?._id || emailHr.jobId;

      if (!jobIdValue) {
        return {
          success: false,
          message: "Job ID not found in email HR record",
          data: null,
        };
      }

      // Find all job applications for this job and populate student details
      const jobApplications = await JobApplicationModel
        .find({ jobId: jobIdValue })
        .populate("userId", "name email mobile profilePicture")
        .lean();

      // Transform the data to include student details
      const students = jobApplications
        .filter((app) => app.userId) // Filter out any null userIds
        .map((app) => {
          const student = app.userId as any;
          return {
            id: student._id.toString(),
            name: student.name || "N/A",
            email: student.email || "N/A",
            phone: student.mobile || "N/A",
            profilePicture: student.profilePicture || null,
          };
        });

      // Get organization name from populated data
      const organizationName = (emailHr.organizationId as any)?.name || null;
      
      // Extract organizationId - if populated, get _id from the object, otherwise use the original value
      let organizationIdStr: string | null = null;
      const orgId = emailHr.organizationId as any;
      if (orgId) {
        // If it's a populated object, extract _id
        if (orgId._id) {
          organizationIdStr = typeof orgId._id === 'string' ? orgId._id : orgId._id.toString();
        } else if (typeof orgId === 'string') {
          // If it's already a string (not populated)
          organizationIdStr = orgId;
        } else {
          // Fallback: try to convert to string
          organizationIdStr = orgId.toString ? orgId.toString() : String(orgId);
        }
      }

      return {
        success: true,
        message: "Email HR details with students fetched successfully",
        data: {
          emailHr: {
            _id: emailHr._id,
            name: emailHr.name,
            email: emailHr.email,
            companyName: emailHr.companyName,
            destination: emailHr.destination,
            organizationId: organizationIdStr,
            organizationName: organizationName,
            job: emailHr.jobId
              ? {
                  _id: (emailHr.jobId as any)._id,
                  name: (emailHr.jobId as any).name,
                  companyName: (emailHr.jobId as any).companyName,
                }
              : null,
          },
          students,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch email HR details with students",
        data: null,
      };
    }
  }

  public async getStudentCVData(
    studentId: string,
    jobId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    try {
      // Validate ObjectIds
      new Types.ObjectId(studentId);
      new Types.ObjectId(jobId);
      new Types.ObjectId(organizationId);

      // Fetch all CV data for the student
      const [profileRes, educationRes, experienceRes, projectRes, certificateRes] = await Promise.all([
        this.cvProfileService.getCVProfileByUserId(studentId),
        this.cvEducationService.getCVEducationByUserId(studentId),
        this.cvExperienceService.getCVExperienceByUserId(studentId),
        this.cvProjectService.getCVProjectByUserId(studentId),
        this.cvCertificateService.getCVCertificateByUserId(studentId),
      ]);

      // Transform the data to match the expected format
      const educationData = Array.isArray(educationRes.data) ? educationRes.data : [];
      const experienceData = Array.isArray(experienceRes.data) ? experienceRes.data : [];
      const projectData = Array.isArray(projectRes.data) ? projectRes.data : [];
      const certificateData = Array.isArray(certificateRes.data) ? certificateRes.data : [];

      // Fetch skills for the job
      let skills: any[] = [];
      try {
        const skillsRes = await this.skillService.getSkillsByJob(jobId);
        if (skillsRes.success && skillsRes.data) {
          const skillsData = Array.isArray(skillsRes.data) ? skillsRes.data : [];

          // Get interviewPlannerId for this job and student
          let interviewPlannerId = null;
          try {
            const interviewPlanner = await InterviewPlannerModel.findOne({
              userId: studentId as any,
              jobId: jobId as any,
            }).lean();
            if (interviewPlanner) {
              interviewPlannerId = (interviewPlanner as any)._id?.toString();
            }
          } catch (error) {
            log.error({ err: error }, "Error fetching interview planner:");
          }

          // For each skill, fetch assessment status and related data
          skills = await Promise.all(
            skillsData.map(async (skill: any, index: number) => {
              const skillId = skill._id?.toString() || skill.id;

              // Fetch average test score for this skill
              let assessmentCompleted = false;
              let score = null;
              let completedDate = null;

              try {
                const averageScoreRes = await this.studentTestHistoryService.getSkillAverageScore(
                  jobId,
                  skillId,
                  studentId,
                  organizationId
                );
                if (averageScoreRes.success && averageScoreRes.data) {
                  const averageData = averageScoreRes.data as any;
                  if (
                    averageData.averageScore !== null &&
                    averageData.averageScore !== undefined
                  ) {
                    assessmentCompleted = true;
                    score = averageData.averageScore;
                  }
                }
              } catch (error) {
                log.error({ err: error }, `Error fetching average score for skill ${skillId}:`);
              }

              // Fetch testimonials (for this student, job, and skill)
              let testimonials: any[] = [];
              try {
                const testimonialsRes = await this.testimonialService.getTestimonialsByUserJobAndSkill(
                  studentId,
                  jobId,
                  skillId
                );
                if (testimonialsRes.success && testimonialsRes.data) {
                  const testimonialsData = Array.isArray(testimonialsRes.data)
                    ? testimonialsRes.data
                    : [];
                  testimonials = testimonialsData.map((testimonial: any) => ({
                    id: testimonial._id?.toString() || testimonial.id,
                    project: testimonial.project || "",
                    validatorName: testimonial.validatorName || "",
                    validatorRole: testimonial.validatorRole || "",
                    status: testimonial.status || "pending",
                    testimonialText: testimonial.testimonialText || "",
                  }));
                }
              } catch (error) {
                log.info(`No testimonials for skill ${skillId}`);
              }

              // Fetch certificates (for this student, job, and skill)
              let certificates: any[] = [];
              try {
                const certificatesRes = await this.certificateService.getCertificatesByStudentJobAndSkill(
                  studentId,
                  jobId,
                  skillId
                );
                if (certificatesRes.success && certificatesRes.data) {
                  const certificatesData = Array.isArray(certificatesRes.data)
                    ? certificatesRes.data
                    : [];
                  certificates = certificatesData.map((cert: any) => ({
                    id: cert._id?.toString() || cert.id,
                    name: cert.title || cert.name || "",
                    issuer: cert.storageProvider || cert.issuer || "",
                    link: cert.link || "",
                  }));
                }
              } catch (error) {
                log.info(`No certificates for skill ${skillId}`);
              }

              // Fetch videos (for this student, job, and skill)
              let videos: any[] = [];
              try {
                const videosRes = await this.studentVideoService.getStudentVideosByUserJobAndSkill(
                  studentId,
                  jobId,
                  skillId
                );
                if (videosRes.success && videosRes.data) {
                  const videosData = Array.isArray(videosRes.data) ? videosRes.data : [];
                  videos = videosData.map((video: any) => ({
                    id: video._id?.toString() || video.id,
                    title: video.title || "",
                    link: video.link || video.url || "",
                  }));
                }
              } catch (error) {
                log.info(`No videos for skill ${skillId}`);
              }

              return {
                id: skillId || `skill-${index}`,
                name: skill.name || skill.title || "Skill",
                type: skill.type || "technical",
                assessmentCompleted,
                score,
                completedDate,
                testimonials,
                certificates,
                videos,
              };
            })
          );
        }
      } catch (error) {
        log.error({ err: error }, `Error fetching skills for job ${jobId}:`);
      }

      const cvData = {
        profile: profileRes.data || null,
        education: educationData.map((edu: any) => ({
          degree: edu.title || edu.degree || "",
          institution: edu.institution || "",
          year: edu.startYear && edu.endYear 
            ? `${edu.startYear}-${edu.endYear}` 
            : edu.startYear || edu.year || "",
          gpa: edu.gpa || "",
        })),
        workExperience: experienceData.map((exp: any) => ({
          title: exp.jobTitle || exp.title || "",
          company: exp.company || "",
          duration: exp.startDate && exp.endDate
            ? `${exp.startDate} - ${exp.endDate}`
            : exp.isCurrent
            ? `${exp.startDate} - Present`
            : exp.startDate || exp.duration || "",
          description: exp.description || "",
        })),
        projects: projectData.map((proj: any) => ({
          name: proj.title || proj.name || "",
          description: proj.description || "",
          technologies: proj.technologies || proj.techStack || "",
          link: proj.link || proj.url || "",
        })),
        skills,
        certificates: certificateData.map((cert: any) => ({
          name: cert.title || cert.name || "",
          issuer: cert.issuer || "",
          date: cert.year || cert.date || "",
          link: cert.link || "", // Include link if available
        })),
      };

      return {
        success: true,
        message: "Student CV data fetched successfully",
        data: cvData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch student CV data",
        data: null,
      };
    }
  }
}

