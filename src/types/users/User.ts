import { GetUsersParams, IUserRepo } from './IUserRepo';
import { userTable } from 'src/services/drizzle/schema';

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