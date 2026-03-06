import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { StudentTestHistoryService } from "../services/studentTestHistory.service";
import { SkillService } from "../services/skill.service";

export class StudentTestHistoryController {
  private studentTestHistoryService = new StudentTestHistoryService();
  private skillService = new SkillService();

  public getStudentTestHistoryBySubject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.studentTestHistoryService.getStudentTestHistoryBySubject(
        req.params.subjectId,
        (req.query.userId as string) || (req.query.studentId as string),
        req.query.organizationId as string,
        req.query.topicId as string
      )
    );

  public getStudentTestHistoryByJob = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.studentTestHistoryService.getStudentTestHistoryByJob(
        req.params.jobId,
        (req.query.userId as string) || (req.query.studentId as string),
        req.query.organizationId as string,
        req.query.skillId as string
      )
    );

  public completeTest = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.studentTestHistoryService.completeTest(
        req.params.studentTestHistoryId,
        req.body.answers,
        req.body.score,
        req.body.correctAnswers,
        req.body.totalQuestions
      )
    );

  public getStudentTestHistoryById = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.studentTestHistoryService.getStudentTestHistoryById(req.params.studentTestHistoryId)
    );

  public getSkillAverageScore = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.studentTestHistoryService.getSkillAverageScore(
        req.params.jobId,
        req.params.skillId,
        (req.query.userId as string) || (req.query.studentId as string),
        req.query.organizationId as string
      )
    );

  public checkTestCompletionStatus = (req: any, res: Response): Promise<void> =>
    handleRequest(res, () =>
      this.studentTestHistoryService.checkTestCompletionStatus(
        req.params.testId,
        (req.query.userId as string) || (req.query.studentId as string),
        req.query.organizationId as string
      )
    );

  public getJobSkillStatus = async (req: any, res: Response): Promise<void> => {
    const jobId = req.params.jobId;
    const userId = (req.query.userId as string) || (req.query.studentId as string) || req.user?._id?.toString();
    if (!jobId || !userId) {
      res.status(400).json({
        success: false,
        message: "jobId and userId are required",
        data: null,
      });
      return;
    }
    try {
      const skillsRes = await this.skillService.getSkillsByJob(jobId);
      const skillsData = (skillsRes.data as Array<{ _id: string; name?: string }>) || [];
      const skills = Array.isArray(skillsData) ? skillsData.filter((s) => s && s._id) : [];
      const result = await this.studentTestHistoryService.getJobSkillStatus(jobId, userId, skills);
      if (!result.success) {
        res.status(500).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to get job skill status",
        data: null,
      });
    }
  };
}

