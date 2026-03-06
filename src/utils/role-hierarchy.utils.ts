import { Request } from "express";
import { decodeToken } from "./jwt";

type UserRole =
  | "adminUser"
  | "school"
  | "principle"
  | "student";

const rolesHierarchy: UserRole[] = [
  "adminUser",
  "school",
  "principle",
  "student",
];

const fetchCreatableRoles = async (req: Request): Promise<UserRole[]> => {
  const decodedUser = await decodeToken(req);

  if (!decodedUser || !decodedUser.role) return [];

  const userRole: UserRole = decodedUser.role;

  const index = rolesHierarchy.indexOf(userRole);

  if (index === -1) return [];

  return rolesHierarchy.slice(index + 1);
};

export { fetchCreatableRoles, UserRole };
