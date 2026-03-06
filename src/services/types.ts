import { LoginInput } from "../schemas/auth.schema";

export interface LoginRequest extends LoginInput {}

export type ServiceResponse = {
  success: boolean;
  message: string;
  data?: object | null;
};
