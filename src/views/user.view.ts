import { IUser } from "../models/user.model";

export const formatUsersOutput = (users: IUser[] | null) => {
  if (!users) return [];
  return users.map((user) => ({
    _id: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
    mobile: user.mobile,
    status: user.status,
    departmentId: user.departmentId,
    department: user.departmentId && typeof user.departmentId === 'object' && 'name' in user.departmentId
      ? (user.departmentId as any).name
      : null
  }));
};
