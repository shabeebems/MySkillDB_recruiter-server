import UserModel, { IUser } from "../models/user.model";
import { BaseRepository } from "./base.repository";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  findByEmail = (email: string): Promise<IUser | null> =>
    this.model.findOne({ email });

  findByFilter = (
    filters: {
      role?: string;
      departmentId?: string;
      organizationId?: string;
      assignmentId?: string;
      name?: string;
      email?: string;
      mobile?: number;
      search?: string;
    },
    skip: number = 0,
    limit: number = 5
  ): Promise<IUser[]> => {
    const query: any = {};

    if (filters.role) query.role = filters.role;
    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.assignmentId) query.assignmentId = filters.assignmentId;
    if (filters.name) query.name = { $regex: filters.name, $options: "i" }; // case-insensitive search
    if (filters.email) query.email = { $regex: filters.email, $options: "i" };
    if (filters.mobile)
      query.mobile = { $regex: filters.mobile, $options: "i" };
    
    // Search across name, email, and mobile fields
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex }
      ];
    }

    return this.model
      .find(query)
      .populate({
        path: "departmentId",
        select: "name",
      })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  };

  findAllByFilter = (filters: {
    role?: string;
    departmentId?: string;
    organizationId?: string;
    assignmentId?: string;
    name?: string;
    email?: string;
    mobile?: number;
    search?: string;
  }): Promise<IUser[]> => {
    const query: any = {};

    if (filters.role) query.role = filters.role;
    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.assignmentId) query.assignmentId = filters.assignmentId;
    if (filters.name) query.name = { $regex: filters.name, $options: "i" };
    if (filters.email) query.email = { $regex: filters.email, $options: "i" };
    if (filters.mobile)
      query.mobile = { $regex: filters.mobile, $options: "i" };
    
    // Search across name, email, and mobile fields
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex }
      ];
    }

    return this.model.find(query).populate({
      path: "departmentId",
      select: "name",
    }).sort({ createdAt: -1 }).exec();
  };

  getCountByFilter = (filters: {
    role?: string;
    departmentId?: string;
    organizationId?: string;
    assignmentId?: string;
    name?: string;
    email?: string;
    mobile?: number;
    search?: string;
  }): Promise<number> => {
    const query: any = {};

    if (filters.role) query.role = filters.role;
    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.assignmentId) query.assignmentId = filters.assignmentId;
    if (filters.name) query.name = { $regex: filters.name, $options: "i" };
    if (filters.email) query.email = { $regex: filters.email, $options: "i" };
    if (filters.mobile)
      query.mobile = { $regex: filters.mobile, $options: "i" };
    
    // Search across name, email, and mobile fields
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex }
      ];
    }

    return this.model.countDocuments(query).exec();
  };

  findUserByToken = (
    token: string,
    jwtSecret: string
  ): Promise<IUser | null> => {
    const verify: any = jwt.verify(token, jwtSecret);
    return this.findByEmail(verify.email);
  };

  findOneWithOrganizations = (id: string): Promise<IUser | null> => {
    return this.model.findById(id).populate({
      path: "organizationIds",
      select:
        "name board establishedYear adminName address country state district",
    });
  };

  // Count students by assignmentId
  countStudentsByAssignmentId = async (assignmentId: string): Promise<number> => {
    return this.model.countDocuments({
      role: "student",
      assignmentId: assignmentId,
      isBlock: false,
      status: "active",
    });
  };

  // Count students by multiple assignmentIds
  countStudentsByAssignmentIds = async (assignmentIds: string[]): Promise<Map<string, number>> => {
    const counts = new Map<string, number>();
    
    if (assignmentIds.length === 0) return counts;
    
    // Use aggregation for better performance
    const results = await this.model.aggregate([
      {
        $match: {
          role: "student",
          assignmentId: { $in: assignmentIds.map((id: string) => new Types.ObjectId(id)) },
          isBlock: false,
          status: "active",
        },
      },
      {
        $group: {
          _id: "$assignmentId",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert results to map
    results.forEach((result: any) => {
      counts.set(result._id.toString(), result.count);
    });

    // Set 0 for assignments with no students
    assignmentIds.forEach((id) => {
      if (!counts.has(id)) {
        counts.set(id, 0);
      }
    });

    return counts;
  };

  // Get students by assignmentId
  findStudentsByAssignmentId = async (assignmentId: string, organizationId: string): Promise<IUser[]> => {
    return this.model.find({
      role: "student",
      assignmentId: assignmentId,
      organizationId: organizationId,
      isBlock: false,
      status: "active",
    }).select("name email mobile image").sort({ name: 1 });
  };
}
