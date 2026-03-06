import { z } from "zod";

export const createJobSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").trim(),
  type: z.enum(["department", "class"], {
    message: "Type must be either 'department' or 'class'",
  }),
  depIds: z.array(z.string()).optional(),
  assignmentIds: z.array(z.string()).optional(),
  jobIds: z.array(z.string()).min(1, "At least one job ID is required").max(3, "Maximum 3 jobs allowed per sprint"),
  startDate: z.union([
    z.string().min(1, "Start date is required"),
    z.date()
  ]).refine(
    (val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return true;
    },
    { message: "Start date must be a valid date" }
  ),
  endDate: z.union([
    z.string().min(1, "End date is required"),
    z.date()
  ]).refine(
    (val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return true;
    },
    { message: "End date must be a valid date" }
  ),
  organizationId: z.string().min(1, "Organization ID is required").trim(),
}).refine(
  (data) => {
    if (data.type === "department") {
      return data.depIds && data.depIds.length > 0;
    }
    return true;
  },
  {
    message: "Department IDs are required when type is 'department'",
    path: ["depIds"],
  }
).refine(
  (data) => {
    if (data.type === "class") {
      return data.assignmentIds && data.assignmentIds.length > 0;
    }
    return true;
  },
  {
    message: "Assignment IDs are required when type is 'class'",
    path: ["assignmentIds"],
  }
);

export type CreateJobSprintInput = z.infer<typeof createJobSprintSchema>;
