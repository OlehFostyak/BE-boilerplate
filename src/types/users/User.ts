import { GetUsersParams, IUserRepo } from './IUserRepo';
import { userTable } from 'src/services/drizzle/schema';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export type UserRole = 'admin' | 'user';

// User object from database
export type User = typeof userTable.$inferSelect;

// User with Cognito status
export interface UserWithStatus extends User {
  status?: string;
  enabled?: boolean;
}

// Result type for getting users with pagination
export interface GetUsersResult {
  users: User[];
  total: number;
}

export interface GetUsersAdminParams extends GetUsersParams {
  userRepo: IUserRepo;
}

export interface UserOperationParams {
  userRepo: IUserRepo;
  userId: string;
}

// Common result interface for user invite operations
export interface UserInviteResult {
  success: boolean;
  errorCode?: EErrorCodes;
  userId?: string;
}

// Invite new user params
export interface InviteUserParams {
  userRepo: IUserRepo;
  email: string;
}

// Resend invite params
export interface ResendInviteParams {
  userRepo: IUserRepo;
  userId: string;
}