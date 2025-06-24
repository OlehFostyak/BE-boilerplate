import { GetUsersParams, IUserRepo } from './IUserRepo';

export type UserRole = 'admin' | 'user';

// User object from database
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  cognitoId: string;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isActive: boolean;
}

// Result type for getting users with pagination
export interface GetUsersResult {
  users: User[];
  total: number;
}

export interface GetUsersAdminParams extends GetUsersParams {
  userRepo: IUserRepo;
}

export interface DeactivateUserParams {
  userRepo: IUserRepo;
  userId: string;
}
    