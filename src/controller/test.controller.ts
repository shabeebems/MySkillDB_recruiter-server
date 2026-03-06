import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request.util";
import { TestService } from "../services/test.service";

export class TestController {
  private testService = new TestService();

  public createTest = (req: any, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const testData = {
        ...req.body,
      };
      
      // If teacher is creating test, validate they have access to the subject
      if (req.user?.role === 'teacher') {
        // Subject is required for teachers
        if (!testData.subjectId) {
          return {
            success: false,
            message: "Subject is required to create a test",
            data: null,
          };
        }

        const hasAccess = await this.testService.validateTeacherSubjectAccess(
          req.user._id.toString(),
          testData.organizationId,
          testData.subjectId
        );
        
        if (!hasAccess) {
          return {
            success: false,
            message: "You don't have access to create tests for this subject. You can only create tests for subjects you are assigned to.",
            data: null,
          };
        }

        // Validate topic access if topicId is provided
        if (testData.topicId) {
          const hasTopicAccess = await this.testService.validateTeacherTopicAccess(
            req.user._id.toString(),
            testData.organizationId,
            testData.topicId
          );
          
          if (!hasTopicAccess) {
            return {
              success: false,
              message: "You don't have access to create tests for this topic",
              data: null,
            };
          }
        }

        // Validate all question topics belong to teacher's assigned subjects
        if (testData.questions && Array.isArray(testData.questions)) {
          for (const question of testData.questions) {
            if (question.topicId) {
              const hasTopicAccess = await this.testService.validateTeacherTopicAccess(
                req.user._id.toString(),
                testData.organizationId,
                question.topicId
              );
              
              if (!hasTopicAccess) {
                return {
                  success: false,
                  message: `You don't have access to create questions for topic: ${question.topicId}`,
                  data: null,
                };
              }
            }
          }
        }
      }
      
      return this.testService.createTest(testData);
    });

  public getTestsBySubject = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.testService.getTestsBySubject(req.params.subjectId));

  public getTestById = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.testService.getTestById(req.params.testId));

  public updateTest = (req: any, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      // If teacher is updating test, validate they own it and have access to the subject
      if (req.user?.role === 'teacher') {
        const test = await this.testService.getTestById(req.params.testId);
        if (!test.success || !test.data) {
          return {
            success: false,
            message: "Test not found",
            data: null,
          };
        }
        
        const testData = test.data as any;
        if (testData.test?.teacherId?.toString() !== req.user._id.toString()) {
          return {
            success: false,
            message: "You can only update your own tests",
            data: null,
          };
        }
        
        // Validate subject access if subject is being changed
        if (req.body.subjectId && req.body.subjectId !== testData.test?.subjectId?.toString()) {
          const hasAccess = await this.testService.validateTeacherSubjectAccess(
            req.user._id.toString(),
            req.body.organizationId || testData.test?.organizationId?.toString(),
            req.body.subjectId
          );
          
          if (!hasAccess) {
            return {
              success: false,
              message: "You don't have access to create tests for this subject",
              data: null,
            };
          }
        }
      }
      
      return this.testService.updateTest(req.params.testId, req.body);
    });

  public getTestsByTopic = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.testService.getTestsByTopic(req.params.topicId));

  public deleteTest = (req: any, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      // If teacher is deleting test, validate they have access to the subject
      if (req.user?.role === 'teacher') {
        const test = await this.testService.getTestById(req.params.testId);
        if (!test.success || !test.data) {
          return {
            success: false,
            message: "Test not found",
            data: null,
          };
        }
        
        const testData = test.data as any;
        const testSubjectId = testData.test?.subjectId?.toString();
        const organizationId = testData.test?.organizationId?.toString();
        
        // Validate teacher has access to the test's subject
        if (testSubjectId) {
          const hasAccess = await this.testService.validateTeacherSubjectAccess(
            req.user._id.toString(),
            organizationId,
            testSubjectId
          );
          
          if (!hasAccess) {
            return {
              success: false,
              message: "You don't have access to delete this test. You can only delete tests for subjects you are assigned to.",
              data: null,
            };
          }
        } else {
          return {
            success: false,
            message: "Cannot delete test without subject",
            data: null,
          };
        }
      }
      
      return this.testService.deleteTest(req.params.testId);
    });

  public getTestsByJob = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.testService.getTestsByJob(req.params.jobId));

  public getTestsBySkill = (req: Request, res: Response): Promise<void> =>
    handleRequest(res, () => this.testService.getTestsBySkill(req.params.skillId));

  public getTestsByTeacherId = (req: any, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const teacherId = req.user?.role === 'teacher' ? req.user._id.toString() : req.params.teacherId;
      const organizationId = req.user?.organizationId || req.query.organizationId;
      
      if (!organizationId) {
        return {
          success: false,
          message: "Organization ID is required",
          data: null,
        };
      }
      
      return this.testService.getTestsByTeacherAssignedSubjects(teacherId, organizationId);
    });

  public getTestsByTeacherIdAndSubject = (req: any, res: Response): Promise<void> =>
    handleRequest(res, async () => {
      const teacherId = req.user?.role === 'teacher' ? req.user._id.toString() : req.params.teacherId;
      const organizationId = req.user?.organizationId || req.query.organizationId;
      const subjectId = req.params.subjectId;
      
      if (!organizationId) {
        return {
          success: false,
          message: "Organization ID is required",
          data: null,
        };
      }
      
      // Validate teacher has access to this subject
      const hasAccess = await this.testService.validateTeacherSubjectAccess(
        teacherId,
        organizationId,
        subjectId
      );
      
      if (!hasAccess) {
        return {
          success: false,
          message: "You don't have access to view tests for this subject",
          data: null,
        };
      }
      
      // Return all tests for this subject (regardless of creator)
      return this.testService.getTestsBySubject(subjectId);
    });
}


