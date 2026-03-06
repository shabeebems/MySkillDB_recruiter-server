import { TestRepository } from "../repositories/test.repository";
import { QuestionService } from "./question.service";
import { ITest } from "../models/test.model";
import { ServiceResponse } from "./types";
import { Messages } from "../constants/messages";
import { TeachingAssignmentService } from "./organization-setup/teachingAssignment.service";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("TestService");


type CreateTestPayload = ITest & {
  questions: Array<{
    questionText: string;
    options: string[];
    topicId?: string;
    skillId?: string;
    difficultyLevel?: "Easy" | "Medium" | "Hard";
    correctAnswer: string;
  }>;
};

export class TestService {
  private testRepository = new TestRepository();
  private questionService = new QuestionService();
  private teachingAssignmentService = new TeachingAssignmentService();

  public async createTest(data: CreateTestPayload): Promise<ServiceResponse> {
    const { questions, ...testData } = data as unknown as CreateTestPayload;

    // Validate: Only one job-level test allowed per job
    if (testData.jobId && !testData.skillId) {
      const jobIdString = typeof testData.jobId === 'string' 
        ? testData.jobId 
        : (testData.jobId as any).toString();
      const existingJobTests = await this.testRepository.findByJobId(jobIdString);
      if (existingJobTests && existingJobTests.length > 0) {
        return {
          success: false,
          message: Messages.JOB_LEVEL_TEST_ALREADY_EXISTS,
          data: null,
        };
      }
    }

    // Validate: Only one skill-level test allowed per skill
    if (testData.skillId) {
      const skillIdString = typeof testData.skillId === 'string' 
        ? testData.skillId 
        : (testData.skillId as any).toString();
      const existingSkillTests = await this.testRepository.findBySkillId(skillIdString);
      if (existingSkillTests && existingSkillTests.length > 0) {
        return {
          success: false,
          message: Messages.SKILL_LEVEL_TEST_ALREADY_EXISTS,
          data: null,
        };
      }
    }

    // Set questionCount from questions array length if not provided
    const questionCount = (testData as any).questionCount ?? questions.length;

    const newTest = await this.testRepository.create({
      ...testData,
      questionCount,
    } as Partial<ITest>);

    for (const q of questions) {
      await this.questionService.createQuestion({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topicId: q.topicId as any,
        skillId: (q as any).skillId as any,
        difficultyLevel: (q.difficultyLevel || (testData as any).difficultyLevel) as any,
        organizationId: (testData as any).organizationId as any,
        testId: (newTest as any)._id,
      });
    }

    return {
      success: true,
      message: Messages.TEST_CREATED_SUCCESS,
      data: newTest,
    };
  }

  public async getTestsBySubject(subjectId: string): Promise<ServiceResponse> {
    const tests = await this.testRepository.findBySubjectId(subjectId);
    return {
      success: true,
      message: Messages.TEST_FETCH_SUCCESS,
      data: tests,
    };
  }

  public async getTestsByTopic(topicId: string): Promise<ServiceResponse> {
    const tests = await this.testRepository.findByTopicId(topicId);
    return {
      success: true,
      message: Messages.TEST_FETCH_SUCCESS,
      data: tests,
    };
  }

  public async getTestsByJob(jobId: string): Promise<ServiceResponse> {
    const tests = await this.testRepository.findByJobId(jobId);
    return {
      success: true,
      message: Messages.TEST_FETCH_SUCCESS,
      data: tests,
    };
  }

  public async getTestsBySkill(skillId: string): Promise<ServiceResponse> {
    const tests = await this.testRepository.findBySkillId(skillId);
    return {
      success: true,
      message: Messages.TEST_FETCH_SUCCESS,
      data: tests,
    };
  }

  public async getTestById(testId: string): Promise<ServiceResponse> {
    const test = await this.testRepository.findById(testId);
    if (!test) {
      return {
        success: false,
        message: Messages.TEST_NOT_FOUND || 'Test not found',
        data: null,
      };
    }

    const questions = await this.questionService.getQuestionsByTestId(testId);

    const assembled = {
      test,
      questions: (questions as any[]).map((q: any) => ({
        ...q.toObject?.() ?? q,
      })),
    };

    return {
      success: true,
      message: Messages.TEST_FETCH_SUCCESS,
      data: assembled,
    };
  }

  public async updateTest(testId: string, data: any): Promise<ServiceResponse> {
    const { questions, ...testUpdate } = data || {};

    // Set questionCount from questions array length if not provided
    const questionCount = testUpdate.questionCount ?? (Array.isArray(questions) ? questions.length : undefined);
    if (questionCount !== undefined) {
      testUpdate.questionCount = questionCount;
    }

    const updatedTest = await this.testRepository.update(testId, testUpdate);
    if (!updatedTest) {
      return {
        success: false,
        message: Messages.TEST_NOT_FOUND,
        data: null,
      };
    }

    const existingQuestions = await this.questionService.getQuestionsByTestId(testId);
    const existingMap = new Map<string, any>();
    (existingQuestions as any[]).forEach((q: any) => existingMap.set(String(q._id), q));

    const incoming = Array.isArray(questions) ? questions : [];
    const seenIds = new Set<string>();

    for (const q of incoming) {
      const qId = q._id || q.id;
      if (qId && existingMap.has(String(qId))) {
        // update question
        await this.questionService.updateQuestion(String(qId), {
          questionText: q.questionText || q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topicId: q.topicId,
          skillId: (q as any).skillId,
          difficultyLevel: q.difficultyLevel || updatedTest.difficultyLevel,
        });

        seenIds.add(String(qId));
      } else {
        // create question
        await this.questionService.createQuestion({
          questionText: q.questionText || q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topicId: q.topicId as any,
          skillId: (q as any).skillId as any,
          difficultyLevel: (q.difficultyLevel || updatedTest.difficultyLevel) as any,
          organizationId: (updatedTest as any).organizationId as any,
          testId: (updatedTest as any)._id,
        });
      }
    }

    // delete removed questions
    for (const [id] of existingMap.entries()) {
      if (!seenIds.has(id)) {
        await this.questionService.deleteQuestion(id);
      }
    }

    return this.getTestById(testId);
  }

  public async deleteTest(testId: string): Promise<ServiceResponse> {
    const test = await this.testRepository.findById(testId);
    if (!test) {
      return {
        success: false,
        message: Messages.TEST_NOT_FOUND,
        data: null,
      };
    }

    const questions = await this.questionService.getQuestionsByTestId(testId);
    for (const q of questions as any[]) {
      await this.questionService.deleteQuestion(String((q as any)._id));
    }

    await this.testRepository.delete(testId);
    return {
      success: true,
      message: Messages.TEST_DELETED_SUCCESS || 'Test deleted successfully',
      data: null,
    };
  }

  public async getTestsByTeacherAssignedSubjects(teacherId: string, organizationId: string): Promise<ServiceResponse> {
    try {
      // Get teacher's assigned subjects
      const subjectsResponse = await this.teachingAssignmentService.getTeacherSubjects(organizationId, teacherId);
      if (!subjectsResponse.success || !subjectsResponse.data) {
        return {
          success: true,
          message: Messages.TEST_FETCH_SUCCESS,
          data: [],
        };
      }

      const subjects = subjectsResponse.data as Array<{ _id: string }>;
      const subjectIds = subjects.map(s => s._id);

      if (subjectIds.length === 0) {
        return {
          success: true,
          message: Messages.TEST_FETCH_SUCCESS,
          data: [],
        };
      }

      // Get all tests for these subjects
      const tests = await this.testRepository.findBySubjectIds(subjectIds);
      return {
        success: true,
        message: Messages.TEST_FETCH_SUCCESS,
        data: tests,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching tests by teacher assigned subjects:");
      return {
        success: false,
        message: "Failed to fetch tests",
        data: null,
      };
    }
  }

  public async validateTeacherSubjectAccess(teacherId: string, organizationId: string, subjectId: string): Promise<boolean> {
    const response = await this.teachingAssignmentService.getTeacherSubjects(organizationId, teacherId);
    if (!response.success || !response.data) {
      return false;
    }

    const teacherSubjects = response.data as Array<{ _id: string }>;
    return teacherSubjects.some(subject => subject._id === subjectId);
  }

  public async validateTeacherTopicAccess(teacherId: string, organizationId: string, topicId: string): Promise<boolean> {
    // First, get the topic to find its subject
    const { TopicService } = await import('./topic.service');
    const topicService = new TopicService();
    const topicResponse = await topicService.getTopicById(topicId);
    
    if (!topicResponse.success || !topicResponse.data) {
      return false;
    }

    const topic = topicResponse.data as any;
    const topicSubjectId = typeof topic.subjectId === 'object' ? topic.subjectId._id : topic.subjectId;
    
    if (!topicSubjectId) {
      return false;
    }

    // Validate that the teacher has access to this subject
    return this.validateTeacherSubjectAccess(teacherId, organizationId, topicSubjectId.toString());
  }
}


