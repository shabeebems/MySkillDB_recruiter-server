import { Types } from "mongoose";
import { StudentTestHistoryRepository } from "../repositories/studentTestHistory.repository";
import { StudentAnswerHistoryRepository } from "../repositories/studentAnswerHistory.repository";
import { TestService } from "./test.service";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { formatStudentTestHistoryResponse } from "../schemas/studentTestHistory.schema";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("StudentTestHistoryService");


export class StudentTestHistoryService {
  private studentTestHistoryRepository = new StudentTestHistoryRepository();
  private studentAnswerHistoryRepository = new StudentAnswerHistoryRepository();
  private testService = new TestService();

  private async ensureStudentTestHistoryRecords(
    subjectId: string | undefined,
    userId: string,
    organizationId: string,
    topicId?: string,
    jobId?: string
  ): Promise<void> {
    try {
      // Get all tests for the subject, topic, job, or job topic
      let testsResponse: ServiceResponse;
      if (jobId && topicId) {
        // Job skill-level tests (topicId is actually skillId for jobs)
        testsResponse = await this.testService.getTestsBySkill(topicId);
        // Filter to only include tests that belong to the job
        const allTests = (testsResponse.data as any[]) || [];
        const jobObjectId = new Types.ObjectId(jobId);
        const tests = allTests.filter((test: any) => 
          test.jobId && String(test.jobId) === String(jobObjectId)
        );
        testsResponse = { ...testsResponse, data: tests };
      } else if (jobId) {
        // Job-level tests
        testsResponse = await this.testService.getTestsByJob(jobId);
      } else if (topicId) {
        // Subject topic-level tests
        testsResponse = await this.testService.getTestsByTopic(topicId);
        // Filter to only include tests that belong to the subject
        const allTests = (testsResponse.data as any[]) || [];
        const subjectObjectId = new Types.ObjectId(subjectId!);
        const tests = allTests.filter((test: any) => 
          test.subjectId && String(test.subjectId) === String(subjectObjectId)
        );
        testsResponse = { ...testsResponse, data: tests };
      } else if (subjectId) {
        // Subject-level tests
        testsResponse = await this.testService.getTestsBySubject(subjectId);
      } else {
        return;
      }
      
      const tests = (testsResponse.data as any[]) || [];

      if (tests.length === 0) {
        return;
      }

      // Get all testIds (these are already ObjectIds from mongoose)
      const testIds = tests.map((test: any) => test._id);

      // Convert userId to ObjectId for query
      const userObjectId = new Types.ObjectId(userId);

      // Check which testIds already have student test history records
      const existingHistory = await this.studentTestHistoryRepository.find({
        userId: userObjectId,
        testId: { $in: testIds },
      } as any);

      const existingTestIds = new Set(
        existingHistory.map((history: any) => String(history.testId))
      );

      // Find testIds that don't have history records
      const missingTestIds = testIds.filter(
        (testId: any) => !existingTestIds.has(String(testId))
      );

      // Create missing records
      if (missingTestIds.length > 0) {
        const recordsToCreate = missingTestIds.map((testId: any) => ({
          userId: userObjectId,
          testId: testId, // Already an ObjectId
          organizationId: new Types.ObjectId(organizationId),
          status: "Pending" as const,
        }));

        await Promise.all(
          recordsToCreate.map((record) =>
            this.studentTestHistoryRepository.create(record as any)
          )
        );
      }
    } catch (error) {
      log.error({ err: error }, "Error ensuring student test history records:");
      // Don't throw, just log the error
    }
  }

  public async getStudentTestHistoryBySubject(
    subjectId: string,
    userId: string | undefined,
    organizationId: string | undefined,
    topicId?: string
  ): Promise<ServiceResponse> {
    try {
      if (!subjectId || !userId || !organizationId) {
        return {
          success: false,
          message: "subjectId, userId, and organizationId are required",
          data: null,
        };
      }

      // First, ensure all test history records exist
      await this.ensureStudentTestHistoryRecords(subjectId, userId, organizationId, topicId);

      // Then fetch the student test history
      let studentTestHistory;
      if (topicId) {
        studentTestHistory = await this.studentTestHistoryRepository.findByTopicIdAndUserId(
          topicId,
          userId
        );
      } else {
        studentTestHistory = await this.studentTestHistoryRepository.findBySubjectIdAndUserId(
          subjectId,
          userId
        );
      }
      
      return {
        success: true,
        message: Messages.TEST_FETCH_SUCCESS || "Student test history fetched successfully",
        data: formatStudentTestHistoryResponse(studentTestHistory),
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student test history by subject:");
      return {
        success: false,
        message: "Failed to fetch student test history",
        data: null,
      };
    }
  }

  public async getStudentTestHistoryByJob(
    jobId: string,
    userId: string | undefined,
    organizationId: string | undefined,
    skillId?: string
  ): Promise<ServiceResponse> {
    try {
      if (!jobId || !userId || !organizationId) {
        return {
          success: false,
          message: "jobId, userId, and organizationId are required",
          data: null,
        };
      }

      // First, ensure all test history records exist
      await this.ensureStudentTestHistoryRecords(undefined, userId, organizationId, skillId, jobId);

      // Then fetch the student test history
      let studentTestHistory;
      if (skillId) {
        studentTestHistory = await this.studentTestHistoryRepository.findByJobSkillIdAndUserId(
          skillId,
          userId
        );
      } else {
        studentTestHistory = await this.studentTestHistoryRepository.findByJobIdAndUserId(
          jobId,
          userId
        );
      }
      
      return {
        success: true,
        message: Messages.TEST_FETCH_SUCCESS || "Student test history fetched successfully",
        data: formatStudentTestHistoryResponse(studentTestHistory),
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student test history by job:");
      return {
        success: false,
        message: "Failed to fetch student test history",
        data: null,
      };
    }
  }

  public async completeTest(
    studentTestHistoryId: string,
    answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean }>,
    score: number,
    correctAnswers: number,
    totalQuestions: number
  ): Promise<ServiceResponse> {
    try {
      // Update student test history
      const updatedHistory = await this.studentTestHistoryRepository.update(
        studentTestHistoryId,
        {
          status: "Completed",
          score,
          correctAnswers,
          totalQuestions,
          completedAt: new Date(),
        } as any
      );

      if (!updatedHistory) {
        return {
          success: false,
          message: "Student test history not found",
          data: null,
        };
      }

      // Save all answers to studentAnswerHistory
      const answerRecords = answers.map((answer) => ({
        userTestId: new Types.ObjectId(studentTestHistoryId) as any,
        questionId: new Types.ObjectId(answer.questionId) as any,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
      }));

      await this.studentAnswerHistoryRepository.createMany(answerRecords as any);

      return {
        success: true,
        message: "Test completed successfully",
        data: updatedHistory,
      };
    } catch (error) {
      log.error({ err: error }, "Error completing test:");
      return {
        success: false,
        message: "Failed to complete test",
        data: null,
      };
    }
  }

  public async getStudentTestHistoryById(studentTestHistoryId: string): Promise<ServiceResponse> {
    try {
      const studentAnswers =
        await this.studentAnswerHistoryRepository.findByUserTestIdWithQuestion(
          studentTestHistoryId
        );
        
      return {
        success: true,
        message: "Student test history fetched successfully",
        data: studentAnswers,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student test history by ID:");
      return {
        success: false,
        message: "Failed to fetch student test history",
        data: null,
      };
    }
  }

  public async checkTestCompletionStatus(
    testId: string,
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    try {
      if (!testId || !userId || !organizationId) {
        return {
          success: false,
          message: "testId, userId, and organizationId are required",
          data: null,
        };
      }

      const studentTestHistory = await this.studentTestHistoryRepository.findByUserAndTestId(
        userId,
        testId
      );

      if (!studentTestHistory) {
        return {
          success: true,
          message: "Test history not found",
          data: {
            isCompleted: false,
            status: "Pending",
            score: null,
            completedAt: null,
          },
        };
      }

      const isCompleted = (studentTestHistory as any).status === "Completed";

      return {
        success: true,
        message: "Test status fetched successfully",
        data: {
          isCompleted,
          status: (studentTestHistory as any).status || "Pending",
          score: (studentTestHistory as any).score || null,
          completedAt: (studentTestHistory as any).completedAt || null,
          studentTestHistoryId: (studentTestHistory as any)._id?.toString() || null,
        },
      };
    } catch (error) {
      log.error({ err: error }, "Error checking test completion status:");
      return {
        success: false,
        message: "Failed to check test completion status",
        data: null,
      };
    }
  }

  public async getSkillAverageScore(
    jobId: string,
    skillId: string,
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse> {
    try {
      if (!jobId || !skillId || !userId || !organizationId) {
        return {
          success: false,
          message: "jobId, skillId, userId, and organizationId are required",
          data: null,
        };
      }

      // Get all completed test histories for this skill in this job
      const studentTestHistory = await this.studentTestHistoryRepository.findByJobSkillIdAndUserId(
        skillId,
        userId
      );

      // Filter only completed tests with scores
      const completedTests = (studentTestHistory as any[]).filter(
        (test: any) => test.status === "Completed" && test.score !== null && test.score !== undefined
      );

      if (completedTests.length === 0) {
        return {
          success: true,
          message: "No completed tests found for this topic",
          data: {
            averageScore: null,
            totalTests: 0,
            completedTests: 0,
          },
        };
      }

      // Calculate average score
      const totalScore = completedTests.reduce((sum: number, test: any) => sum + (test.score || 0), 0);
      const averageScore = Math.round((totalScore / completedTests.length) * 100) / 100; // Round to 2 decimal places

      return {
        success: true,
        message: "Topic average score calculated successfully",
        data: {
          averageScore,
          totalTests: completedTests.length,
          completedTests: completedTests.length,
        },
      };
    } catch (error) {
      log.error({ err: error }, "Error calculating topic average score:");
      return {
        success: false,
        message: "Failed to calculate topic average score",
        data: null,
      };
    }
  }

  /**
   * For each job skill, returns whether the student has answered at least one
   * question correctly in any completed assessment for that skill.
   * Used to suggest only skills where the user demonstrated competence (got something right).
   */
  public async getSkillsWithAtLeastOneCorrectAnswer(
    skillIds: string[],
    userId: string
  ): Promise<ServiceResponse> {
    try {
      if (!skillIds?.length || !userId) {
        return {
          success: true,
          message: "No skills or user",
          data: {} as Record<string, boolean>,
        };
      }

      const result: Record<string, boolean> = {};

      for (const skillId of skillIds) {
        const histories = await this.studentTestHistoryRepository.findByJobSkillIdAndUserId(
          skillId,
          userId
        );
        const completed = (histories as any[]).filter(
          (h: any) => h.status === "Completed"
        );
        let hasCorrect = false;
        for (const record of completed) {
          const recordId = (record._id || record.id)?.toString();
          if (!recordId) continue;
          const answers = await this.studentAnswerHistoryRepository.findByUserTestId(
            recordId
          );
          const answersList = Array.isArray(answers) ? answers : [];
          if (answersList.some((a: any) => a.isCorrect === true)) {
            hasCorrect = true;
            break;
          }
        }
        result[skillId] = hasCorrect;
      }

      return {
        success: true,
        message: "Skill correct-answer status fetched",
        data: result,
      };
    } catch (error) {
      log.error({ err: error }, "Error getting skills with at least one correct answer:");
      return {
        success: false,
        message: "Failed to get skill correct-answer status",
        data: null,
      };
    }
  }

  /**
   * For a job's skills, returns which skills have been tested (at least one
   * completed assessment) and which have at least one correct answer.
   * Includes both skill-level tests and job-level assessments (questions linked to skills).
   */
  public async getJobSkillStatus(
    jobId: string,
    userId: string,
    skills: Array<{ _id: string; name?: string }>
  ): Promise<ServiceResponse> {
    try {
      if (!skills?.length || !userId) {
        return {
          success: true,
          message: "No skills or user",
          data: {
            skillsTested: [],
            skillsWithCorrectAnswer: [],
          },
        };
      }

      const jobSkillIds = new Set(skills.map((s) => String(s._id)));
      const testedIds = new Set<string>();
      const correctIds = new Set<string>();

      // 1) Skill-level tests: completed tests per skill + at least one correct answer
      for (const skill of skills) {
        const skillId = String(skill._id);
        const histories = await this.studentTestHistoryRepository.findByJobSkillIdAndUserId(
          skillId,
          userId
        );
        const completed = (histories as any[]).filter(
          (h: any) => h.status === "Completed"
        );
        if (completed.length > 0) {
          testedIds.add(skillId);
          for (const record of completed) {
            const recordId = (record._id || record.id)?.toString();
            if (!recordId) continue;
            const answers = await this.studentAnswerHistoryRepository.findByUserTestId(
              recordId
            );
            const answersList = Array.isArray(answers) ? answers : [];
            if (answersList.some((a: any) => a.isCorrect === true)) {
              correctIds.add(skillId);
              break;
            }
          }
        }
      }

      // 2) Job-level assessments: completed job-level tests; each question may have skillId
      const jobLevelHistories = await this.studentTestHistoryRepository.findByJobIdAndUserId(
        jobId,
        userId
      );
      const jobLevelCompleted = (jobLevelHistories as any[]).filter(
        (h: any) => h.status === "Completed"
      );
      for (const record of jobLevelCompleted) {
        const recordId = (record._id || record.id)?.toString();
        if (!recordId) continue;
        const answersWithSkill = await this.studentAnswerHistoryRepository.findByUserTestIdWithQuestionSkill(
          recordId
        );
        const answersList = Array.isArray(answersWithSkill) ? answersWithSkill : [];
        for (const a of answersList) {
          const q = (a as any).questionId;
          if (!q) continue;
          const rawSkillId = q.skillId;
          const skillId = rawSkillId ? (typeof rawSkillId === "object" && rawSkillId._id ? String((rawSkillId as any)._id) : String(rawSkillId)) : null;
          if (!skillId || !jobSkillIds.has(skillId)) continue;
          testedIds.add(skillId);
          if ((a as any).isCorrect === true) {
            correctIds.add(skillId);
          }
        }
      }

      const skillMap = new Map(skills.map((s) => [String(s._id), { _id: String(s._id), name: s.name || "Unknown" }]));
      const skillsTested = Array.from(testedIds).map((id) => skillMap.get(id)!).filter(Boolean);
      const skillsWithCorrectAnswer = Array.from(correctIds).map((id) => skillMap.get(id)!).filter(Boolean);

      return {
        success: true,
        message: "Job skill status fetched",
        data: {
          skillsTested,
          skillsWithCorrectAnswer,
        },
      };
    } catch (error) {
      log.error({ err: error }, "Error getting job skill status:");
      return {
        success: false,
        message: "Failed to get job skill status",
        data: null,
      };
    }
  }
}

