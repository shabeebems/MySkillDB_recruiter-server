import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary";
import { UserRepository } from "../repositories/user.repository";
import { Messages } from "../constants/messages";
import { ServiceResponse } from "./types";
import { IUser } from "../models/user.model";
import { formatUsersOutput } from "../views/user.view";
import { decryptPassword, isEncryptedPassword } from "../utils/passwordDecrypt";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("UserService");


export class UserService {
  private userRepository = new UserRepository();

  public async createUser(data: IUser): Promise<ServiceResponse> {
    // Validate required fields
    if (!data.name || !data.email || !data.mobile) {
      return {
        success: false,
        message: 'Name, email, and mobile are required',
        data: null,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return {
        success: false,
        message: 'Invalid email format',
        data: null,
      };
    }

    // Validate mobile format (10+ digits, may include country code with +)
    const mobileRegex = /^[+]?[\d\s\-()]{10,}$/;
    const mobileString = data.mobile.toString().trim();
    if (!mobileRegex.test(mobileString) || mobileString.replace(/\D/g, '').length < 10) {
      return {
        success: false,
        message: 'Invalid mobile number format (must be at least 10 digits)',
        data: null,
      };
    }

    const existingUserByEmail = await this.userRepository.findByEmail(data.email);
    if (existingUserByEmail) {
      return {
        success: false,
        message: Messages.EMAIL_ALREADY_EXISTS,
        data: null,
      };
    }

    // Check for duplicate mobile
    const existingUserByMobile = await this.userRepository.findOne({
      mobile: data.mobile,
    });
    if (existingUserByMobile) {
      return {
        success: false,
        message: Messages.MOBILE_NUMBER_ALREADY_EXISTS,
        data: null,
      };
    }

    // HOD-specific uniqueness logic removed (HOD role no longer used)

    const plainPassword =
      (data.name?.slice(0, 4).toUpperCase() || "USER") +
      (data.mobile?.toString().slice(0, 4) || "0000");

    // Hash password with bcrypt (as before)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    data.password = hashedPassword;

    const newUser = await this.userRepository.create(data);
    return {
      success: true,
      message: Messages.USER_CREATED_SUCCESS,
      data: newUser,
    };
  }

  public async findUsersByFilter(query: any): Promise<ServiceResponse> {
    // Build filter query (exclude pagination params)
    const filters: any = {};
    if (query.role) filters.role = query.role;
    if (query.departmentId) filters.departmentId = query.departmentId;
    if (query.organizationId) filters.organizationId = query.organizationId;
    if (query.assignmentId) filters.assignmentId = query.assignmentId;
    if (query.name) filters.name = query.name;
    if (query.email) filters.email = query.email;
    if (query.mobile) filters.mobile = query.mobile;
    
    // Add search parameter to search across name, email, and mobile
    if (query.search) {
      filters.search = query.search;
    }

    // Always use pagination with defaults: page 1, limit 10
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await this.userRepository.findByFilter(filters, skip, limit);
    const totalCount = await this.userRepository.getCountByFilter(filters);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      message: Messages.CREATABLE_ROLES_FETCHED,
      data: {
        users: formatUsersOutput(users),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit,
        },
      },
    };
  }

  public async getAccManagerById(id: string): Promise<ServiceResponse> {
    const users = await this.userRepository.findOneWithOrganizations(id);
    log.info({ data: users }, "Fetched user:");
    return {
      success: true,
      message: Messages.CREATABLE_ROLES_FETCHED,
      data: users,
    };
  }

  public async updateUser(id: string, data: any): Promise<ServiceResponse> {
    // If password is being updated, decrypt if encrypted, then hash with bcrypt
    if (data.password) {
      let plainPassword: string;
      
      if (isEncryptedPassword(data.password)) {
        try {
          // Decrypt the password
          plainPassword = decryptPassword(data.password);
        } catch (error) {
          return {
            success: false,
            message: "Invalid encrypted password format",
            data: null,
          };
        }
      } else {
        // Plain password
        plainPassword = data.password;
      }
      
      // Hash with bcrypt (as before)
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      data.password = hashedPassword;
    }

    // Handle profile picture upload if present
    if (data.profilePicture && data.profilePicture.startsWith('data:image')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(data.profilePicture, {
          folder: 'user_profiles',
          resource_type: 'image',
        });
        
        data.profilePicture = uploadResponse.secure_url;
      } catch (error) {
        log.error({ err: error }, "Cloudinary upload error:");
        delete data.profilePicture; 
      }
    }
    
    const users = await this.userRepository.update(id, data);
    return {
      success: true,
      message: Messages.CREATABLE_ROLES_FETCHED,
      data: users,
    };
  }

  public async changePassword(userId: string, oldPassword: string, newPassword: string, confirmPassword: string): Promise<ServiceResponse> {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
        data: null,
      };
    }

    // Validate old password is provided
    if (!oldPassword) {
      return {
        success: false,
        message: Messages.OLD_PASSWORD_REQUIRED,
        data: null,
      };
    }

    // Get user to verify old password
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: Messages.USER_NOT_FOUND,
        data: null,
      };
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return {
        success: false,
        message: Messages.OLD_PASSWORD_INCORRECT,
        data: null,
      };
    }

    // Validate new password format: at least 8 characters and 1 digit
    if (!newPassword || newPassword.length < 8 || !/\d/.test(newPassword)) {
      return {
        success: false,
        message: Messages.PASSWORD_INVALID_FORMAT,
        data: null,
      };
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: Messages.PASSWORD_MISMATCH,
        data: null,
      };
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return {
        success: false,
        message: "New password must be different from your current password",
        data: null,
      };
    }

    try {
      // Decrypt password if encrypted, then hash with bcrypt
      let plainNewPassword: string;
      
      if (isEncryptedPassword(newPassword)) {
        try {
          plainNewPassword = decryptPassword(newPassword);
        } catch (error) {
          return {
            success: false,
            message: "Invalid encrypted password format",
            data: null,
          };
        }
      } else {
        plainNewPassword = newPassword;
      }
      
      // Hash the new password with bcrypt (as before)
      const hashedPassword = await bcrypt.hash(plainNewPassword, 10);
      
      // Update user password
      const updatedUser = await this.userRepository.update(userId, { password: hashedPassword });
      
      if (!updatedUser) {
        return {
          success: false,
          message: Messages.PASSWORD_CHANGE_FAILED,
          data: null,
        };
      }

      return {
        success: true,
        message: Messages.PASSWORD_CHANGE_SUCCESS,
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: Messages.PASSWORD_CHANGE_FAILED,
        data: null,
      };
    }
  }

  public async deleteUser(id: string): Promise<ServiceResponse> {
    const users = await this.userRepository.delete(id);
    return {
      success: true,
      message: Messages.CREATABLE_ROLES_FETCHED,
      data: users,
    };
  }

  public async bulkCreateStudents(students: IUser[]): Promise<ServiceResponse> {
    // Server-side validation: Maximum 30 students
    if (!Array.isArray(students)) {
      return {
        success: false,
        message: 'Invalid students data format',
        data: null,
      };
    }

    if (students.length > 30) {
      return {
        success: false,
        message: 'Maximum 30 students can be uploaded at once',
        data: {
          addedCount: 0,
          failedCount: students.length,
          failedUsers: students.map(student => ({
            name: student.name || '',
            email: student.email || '',
            mobile: student.mobile || '',
            reason: 'Maximum 30 students limit exceeded'
          }))
        },
      };
    }

    const failedUsers: Array<{ name: string; email: string; mobile: string; reason: string }> = [];
    const createdUsers: IUser[] = [];

    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.mobile) {
          failedUsers.push({
            name: studentData.name || '',
            email: studentData.email || '',
            mobile: studentData.mobile || '',
            reason: 'Name, email, and mobile are required'
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email.trim())) {
          failedUsers.push({
            name: studentData.name,
            email: studentData.email,
            mobile: studentData.mobile,
            reason: 'Invalid email format'
          });
          continue;
        }

        // Validate mobile format (10+ digits, may include country code with +)
        const mobileRegex = /^[+]?[\d\s\-()]{10,}$/;
        const mobileString = studentData.mobile.toString().trim();
        if (!mobileRegex.test(mobileString) || mobileString.replace(/\D/g, '').length < 10) {
          failedUsers.push({
            name: studentData.name,
            email: studentData.email,
            mobile: studentData.mobile,
            reason: 'Invalid mobile number format (must be at least 10 digits)'
          });
          continue;
        }

        // Check for duplicate email
        const existingUserByEmail = await this.userRepository.findByEmail(studentData.email);
        if (existingUserByEmail) {
          failedUsers.push({
            name: studentData.name,
            email: studentData.email,
            mobile: studentData.mobile,
            reason: 'Email already exists'
          });
          continue;
        }

        // Check for duplicate mobile
        const existingUserByMobile = await this.userRepository.findOne({
          mobile: studentData.mobile,
        });
        if (existingUserByMobile) {
          failedUsers.push({
            name: studentData.name,
            email: studentData.email,
            mobile: studentData.mobile,
            reason: 'Mobile number already exists'
          });
          continue;
        }

        // Generate password
        const plainPassword =
          (studentData.name?.slice(0, 4).toUpperCase() || "USER") +
          (studentData.mobile?.toString().slice(0, 4) || "0000");

        // Hash password with bcrypt (as before)
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        studentData.password = hashedPassword;

        // Set default values
        studentData.role = 'student';
        studentData.isVerified = true;
        studentData.isBlock = false;
        studentData.status = 'active';

        // Create user
        const newUser = await this.userRepository.create(studentData);
        createdUsers.push(newUser);
      } catch (error: any) {
        failedUsers.push({
          name: studentData.name || '',
          email: studentData.email || '',
          mobile: studentData.mobile || '',
          reason: error.message || 'Failed to create user'
        });
      }
    }

    return {
      success: true,
      message: `Bulk upload completed. ${createdUsers.length} added, ${failedUsers.length} failed.`,
      data: {
        addedCount: createdUsers.length,
        failedCount: failedUsers.length,
        failedUsers: failedUsers
      },
    };
  }
}
