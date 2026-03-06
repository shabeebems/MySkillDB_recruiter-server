import express from "express";
import { OrganizationSetupController } from "../controller/organization-setup.controller";
import { validate } from "../middlewares/zodValidate";
import { classSchema, departmentSchema, sectionSchema, subjectSchema, assignmentSchema, teachingAssignmentSchema, assignTeacherSchema, removeSubjectSchema } from "../schemas/organization-setup.schema";
import { authenticateToken } from "../middlewares/tokenValidation";

const router = express.Router();
const controller = new OrganizationSetupController();

// Student accessible routes - placed before global middleware
router.get("/assignments/:id", authenticateToken(["master_admin", "org_admin", "student"]), controller.getAssignmentById);
router.get("/teachingAssignments/:organizationId/:assignmentId", authenticateToken(["master_admin", "org_admin", "student"]), controller.getTeachingAssignmentByOrgAndAssignment);

// Teacher & HOD accessible routes removed (roles no longer used)

router.use(authenticateToken(["master_admin", "org_admin"]));

// -------- Departments --------
router.post("/departments", validate(departmentSchema), controller.createDepartment);
router.get("/departments/:organizationId/count", controller.getDepartmentCount);
router.get("/departments/:organizationId", controller.getDepartments);
router.put("/departments/:id", validate(departmentSchema), controller.updateDepartment);
router.delete("/departments/:id", controller.deleteDepartment);

// -------- Classes --------
router.post("/classes", validate(classSchema), controller.createClass);
router.get("/classes/:organizationId", controller.getClasses);
router.get("/classes/:organizationId/:departmentId", controller.getClassesByDepartmentsFromAssignments);
router.put("/classes/:id", validate(classSchema), controller.updateClass);
router.delete("/classes/:id", controller.deleteClass);

// -------- Sections --------
router.post("/sections", validate(sectionSchema), controller.createSection);
router.get("/sections/:organizationId", controller.getSections);
router.get("/sections/:organizationId/:departmentId/:classId", controller.getSectionsByClassFromAssignments);
router.put("/sections/:id", validate(sectionSchema), controller.updateSection);
router.delete("/sections/:id", controller.deleteSection);

// -------- Subjects --------
router.post("/subjects", validate(subjectSchema), controller.createSubject);
router.get("/subjects/:organizationId", controller.getSubjects);
router.put("/subjects/:id", validate(subjectSchema), controller.updateSubject);
router.delete("/subjects/:id", controller.deleteSubject);
router.get("/subjects/:organizationId/:departmentId", controller.getSubjectsByDepartment);

// -------- Assignments --------
router.post("/assignments", validate(assignmentSchema), controller.createAssignment);
router.get("/assignments/:organizationId/:departmentId/:classId", controller.getAssignmentsByOrgDeptAndClass);
router.get("/assignments/bulk", controller.getAssignmentsByIds);
router.delete("/assignments/:id", controller.deleteAssignment);

router.post("/teachingAssignments", validate(teachingAssignmentSchema), controller.createTeachingAssignment);
router.patch("/teachingAssignments/:assignmentId/teachers/:subjectId", validate(assignTeacherSchema), controller.assignTeacher);
router.patch("/teachingAssignments/:assignmentId/subjects/:subjectId", validate(removeSubjectSchema), controller.removeSubjectFromTeachingAssignment);

export default router;
