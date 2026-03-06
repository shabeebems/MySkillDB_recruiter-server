import { Messages } from "../../constants/messages";
import { ITeachingAssignment } from "../../models/teachingAssignment.model";
import { teachingAssignmentRepository } from "../../repositories/teachingAssignment.repository";
import { UserRepository } from "../../repositories/user.repository";
import { ServiceResponse } from "../types";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("TeachingAssignmentService");


export class TeachingAssignmentService {
  private teachingAssignmentRepository = new teachingAssignmentRepository();
  private userRepository = new UserRepository();

  public createTeachingAssignment = async (
    data: ITeachingAssignment
  ): Promise<ServiceResponse> => {
    // Create individual document for each subject-teacher assignment
    const created = await this.teachingAssignmentRepository.create(data);
    return {
      success: true,
      message: Messages.TEACHING_ASSIGNMENT_CREATED_SUCCESS,
      data: created,
    };
  };

  public getTeachingAssignmentByOrgAndAssignment = async (
    organizationId: string,
    assignmentId: string
  ): Promise<ServiceResponse> => {
    const assignment = await this.teachingAssignmentRepository.findByOrgAndAssignment(
      organizationId,
      assignmentId
    );
    return {
      success: true,
      message: Messages.TEACHING_ASSIGNMENTS_FETCHED_SUCCESS,
      data: assignment,
    };
  };

  public assignTeacher = async (
    params: { assignmentId: string; subjectId: string },
    body: { organizationId: string; teacherId: string }
  ): Promise<ServiceResponse> => {
    const { assignmentId, subjectId } = params;
    const { organizationId, teacherId } = body;
    await this.teachingAssignmentRepository.assignOrUpdateTeacher(
      assignmentId,
      organizationId,
      subjectId,
      teacherId
    );
    return {
      success: true,
      message: Messages.TEACHING_ASSIGNMENT_UPDATED_SUCCESS,
    };
  };

  public removeSubject = async (
    params: { assignmentId: string; subjectId: string },
    body: { organizationId: string }
  ): Promise<ServiceResponse> => {
    const { assignmentId, subjectId } = params;
    const { organizationId } = body;
    await this.teachingAssignmentRepository.removeSubjectFromAssignment(
      assignmentId,
      organizationId,
      subjectId
    );
    return {
      success: true,
      message: Messages.TEACHING_ASSIGNMENT_UPDATED_SUCCESS,
    };
  };

  public getTeacherClasses = async (
    organizationId: string,
    teacherId: string
  ): Promise<ServiceResponse> => {
    const teachingAssignments = await this.teachingAssignmentRepository.findByTeacherId(
      organizationId,
      teacherId
    );

    // Group by class and collect unique sections with assignment mapping and subjects
    const classesMap = new Map<string, {
      _id: string;
      name: string;
      department: string;
      sections: Map<string, {
        assignmentId: string;
        subjects: Array<{ _id: string; name: string; code: string }>;
      }>;
      assignments: string[];
    }>();

    teachingAssignments.forEach((ta) => {
      const assignment = ta.assignmentId as any; // Type assertion for populated fields
      if (!assignment) return;

      // Check if fields are populated (objects) or just ObjectIds
      const classData = assignment.classId;
      const departmentData = assignment.departmentId;
      const sectionData = assignment.sectionId;
      const subjectData = ta.subjectId as any;

      if (!classData) return;

      // Handle both populated objects and ObjectIds
      const classId = (classData._id?.toString() || classData.toString()) as string;
      const className = (classData as any).name || "Unknown Class";
      const departmentName = (departmentData as any)?.name || "Unknown Department";
      const sectionName = (sectionData as any)?.name || "Unknown Section";
      const assignmentId = assignment._id?.toString() || assignment._id.toString();
      
      // Get subject info
      const subject = {
        _id: (subjectData?._id?.toString() || subjectData?.toString()) as string,
        name: (subjectData as any)?.name || "Unknown Subject",
        code: (subjectData as any)?.code || "",
      };

      if (!classesMap.has(classId)) {
        const sectionMap = new Map<string, {
          assignmentId: string;
          subjects: Array<{ _id: string; name: string; code: string }>;
        }>();
        sectionMap.set(sectionName, {
          assignmentId: assignmentId,
          subjects: [subject],
        });
        
        classesMap.set(classId, {
          _id: classId,
          name: className,
          department: departmentName,
          sections: sectionMap,
          assignments: [assignmentId],
        });
      } else {
        const existingClass = classesMap.get(classId);
        if (existingClass) {
          if (existingClass.sections.has(sectionName)) {
            // Add subject to existing section if not already present
            const section = existingClass.sections.get(sectionName);
            if (section) {
              const subjectExists = section.subjects.some(s => s._id === subject._id);
              if (!subjectExists) {
                section.subjects.push(subject);
              }
            }
          } else {
            // Create new section entry
            existingClass.sections.set(sectionName, {
              assignmentId: assignmentId,
              subjects: [subject],
            });
          }
          
          if (!existingClass.assignments.includes(assignmentId)) {
            existingClass.assignments.push(assignmentId);
          }
        }
      }
    });

    // Convert map to array and format sections with assignment mapping and subjects
    const classes = Array.from(classesMap.values()).map((cls) => {
      const sectionsArray = Array.from(cls.sections.entries()).map(([sectionName, sectionData]) => ({
        name: sectionName,
        assignmentId: sectionData.assignmentId,
        subjects: sectionData.subjects,
      }));

      return {
        _id: cls._id,
        name: cls.name,
        department: cls.department,
        sections: sectionsArray,
        assignments: cls.assignments,
      };
    });

    return {
      success: true,
      message: "Teacher classes fetched successfully",
      data: classes,
    };
  };

  public getStudentCountsByAssignments = async (
    organizationId: string,
    assignmentIds: string[]
  ): Promise<ServiceResponse> => {
    if (!assignmentIds || assignmentIds.length === 0) {
      return {
        success: true,
        message: "Student counts fetched successfully",
        data: {},
      };
    }

    const studentCounts = await this.userRepository.countStudentsByAssignmentIds(assignmentIds);
    
    // Convert Map to object for JSON response
    const countsObject: { [key: string]: number } = {};
    studentCounts.forEach((count, assignmentId) => {
      countsObject[assignmentId] = count;
    });

    return {
      success: true,
      message: "Student counts fetched successfully",
      data: countsObject,
    };
  };

  public getStudentsByAssignment = async (
    organizationId: string,
    assignmentId: string
  ): Promise<ServiceResponse> => {
    if (!assignmentId) {
      return {
        success: false,
        message: "Assignment ID is required",
        data: [],
      };
    }

    const students = await this.userRepository.findStudentsByAssignmentId(assignmentId, organizationId);
    
    return {
      success: true,
      message: "Students fetched successfully",
      data: students,
    };
  };

  public getTeacherSubjects = async (
    organizationId: string,
    teacherId: string
  ): Promise<ServiceResponse> => {
    const teachingAssignments = await this.teachingAssignmentRepository.findByTeacherId(
      organizationId,
      teacherId
    );

    // Get unique subjects
    const subjectsMap = new Map<string, {
      _id: string;
      name: string;
      code: string;
    }>();

    teachingAssignments.forEach((ta) => {
      const subject = ta.subjectId as any;
      if (subject) {
        const subjectId = (subject._id?.toString() || subject.toString()) as string;
        const subjectName = (subject as any).name || "Unknown Subject";
        const subjectCode = (subject as any).code || "";

        if (!subjectsMap.has(subjectId)) {
          subjectsMap.set(subjectId, {
            _id: subjectId,
            name: subjectName,
            code: subjectCode,
          });
        }
      }
    });

    const subjects = Array.from(subjectsMap.values());

    return {
      success: true,
      message: "Teacher subjects fetched successfully",
      data: subjects,
    };
  };

  public getStudentTestHistory = async (
    organizationId: string,
    teacherId: string,
    studentId: string
  ): Promise<ServiceResponse> => {
    try {
      // Get teacher's assigned subjects
      const subjectsResponse = await this.getTeacherSubjects(organizationId, teacherId);
      if (!subjectsResponse.success || !subjectsResponse.data) {
        return {
          success: false,
          message: "Failed to fetch teacher subjects",
          data: null,
        };
      }

      const teacherSubjects = subjectsResponse.data as Array<{ _id: string }>;
      const subjectIds = teacherSubjects.map(s => s._id);

      if (subjectIds.length === 0) {
        return {
          success: true,
          message: "No subjects assigned to teacher",
          data: [],
        };
      }

      // Get all test history for this student
      const { StudentTestHistoryRepository } = await import("../../repositories/studentTestHistory.repository");
      const { Types } = await import("mongoose");
      const studentTestHistoryRepository = new StudentTestHistoryRepository();
      const allTestHistory = await studentTestHistoryRepository.find({
        userId: new Types.ObjectId(studentId),
        organizationId: new Types.ObjectId(organizationId),
      } as any);

      // Get test details and filter by teacher's subjects
      const { TestService } = await import("../../services/test.service");
      const testService = new TestService();
      
      const filteredHistory = await Promise.all(
        allTestHistory.map(async (history: any) => {
          const testId = String(history.testId);
          const testResponse = await testService.getTestById(testId);
          
          if (!testResponse.success || !testResponse.data) {
            return null;
          }

          const test = (testResponse.data as any).test;
          const testSubjectId = test?.subjectId?.toString();
          
          // Only include tests for teacher's assigned subjects
          if (testSubjectId && subjectIds.includes(testSubjectId)) {
            return {
              _id: history._id,
              test: {
                _id: test._id,
                name: test.name,
                difficultyLevel: test.difficultyLevel,
                questionCount: test.questionCount,
                subjectId: testSubjectId,
                topicId: test.topicId?.toString(),
              },
              status: history.status,
              score: history.score,
              correctAnswers: history.correctAnswers,
              totalQuestions: history.totalQuestions,
              startedAt: history.startedAt,
              completedAt: history.completedAt,
              createdAt: history.createdAt,
            };
          }
          return null;
        })
      );

      const validHistory = filteredHistory.filter(h => h !== null);

      return {
        success: true,
        message: "Student test history fetched successfully",
        data: validHistory,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student test history:");
      return {
        success: false,
        message: "Failed to fetch student test history",
        data: null,
      };
    }
  };

  public getStudentCourseProgress = async (
    organizationId: string,
    teacherId: string,
    studentId: string
  ): Promise<ServiceResponse> => {
    try {
      // Get teacher's assigned subjects
      const subjectsResponse = await this.getTeacherSubjects(organizationId, teacherId);
      if (!subjectsResponse.success || !subjectsResponse.data) {
        return {
          success: false,
          message: "Failed to fetch teacher subjects",
          data: null,
        };
      }

      const teacherSubjects = subjectsResponse.data as Array<{ _id: string; name: string; code: string }>;

      if (teacherSubjects.length === 0) {
        return {
          success: true,
          message: "No subjects assigned to teacher",
          data: [],
        };
      }

      // Get student test history
      const testHistoryResponse = await this.getStudentTestHistory(organizationId, teacherId, studentId);
      if (!testHistoryResponse.success) {
        return {
          success: false,
          message: "Failed to fetch test history",
          data: null,
        };
      }

      const testHistory = (testHistoryResponse.data || []) as any[];

      // Get topics for each subject
      const { TopicService } = await import("../../services/topic.service");
      const topicService = new TopicService();

      // Calculate progress for each subject
      const progressData = await Promise.all(
        teacherSubjects.map(async (subject) => {
          // Get topics for this subject
          const topicsResponse = await topicService.getTopicsBySubject(subject._id);
          const topics = (topicsResponse.data || []) as any[];

          // Get tests for this subject
          const subjectTests = testHistory.filter(
            (th) => th.test?.subjectId === subject._id && !th.test?.topicId
          );

          // Calculate topic-level progress
          const topicProgress = await Promise.all(
            topics.map(async (topic) => {
              const topicTests = testHistory.filter(
                (th) => th.test?.topicId === topic._id?.toString() || th.test?.topicId === topic._id
              );
              
              const completedTests = topicTests.filter((t) => t.status === "Completed");
              const totalTests = topicTests.length;
              const averageScore = completedTests.length > 0
                ? completedTests.reduce((sum, t) => sum + (t.score || 0), 0) / completedTests.length
                : 0;

              return {
                _id: topic._id?.toString() || topic._id,
                name: topic.name || topic.title,
                totalTests,
                completedTests: completedTests.length,
                averageScore: Math.round(averageScore * 100) / 100,
                progress: totalTests > 0 ? Math.round((completedTests.length / totalTests) * 100) : 0,
              };
            })
          );

          // Calculate subject-level progress
          const completedSubjectTests = subjectTests.filter((t) => t.status === "Completed");
          const totalSubjectTests = subjectTests.length;
          const subjectAverageScore = completedSubjectTests.length > 0
            ? completedSubjectTests.reduce((sum, t) => sum + (t.score || 0), 0) / completedSubjectTests.length
            : 0;

          return {
            _id: subject._id,
            name: subject.name,
            code: subject.code,
            totalTests: totalSubjectTests,
            completedTests: completedSubjectTests.length,
            averageScore: Math.round(subjectAverageScore * 100) / 100,
            progress: totalSubjectTests > 0 ? Math.round((completedSubjectTests.length / totalSubjectTests) * 100) : 0,
            topics: topicProgress,
          };
        })
      );

      return {
        success: true,
        message: "Student course progress fetched successfully",
        data: progressData,
      };
    } catch (error) {
      log.error({ err: error }, "Error fetching student course progress:");
      return {
        success: false,
        message: "Failed to fetch student course progress",
        data: null,
      };
    }
  };
}
