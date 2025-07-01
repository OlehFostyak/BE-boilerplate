import { User, NewUser } from 'src/types/User';
import { GetUsersResult, UserWithStatus } from 'src/types/users/User';

export interface CreateUserParams {
  cognitoId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface GetUsersParams {
  limit: number;
  offset: number;
  search?: string;
}

export interface IUserRepo {
  createUser(user: CreateUserParams): Promise<User>;
  // These methods now return UserWithStatus when a user is found
  getUserById(id: string): Promise<UserWithStatus | undefined>;
  getUserByCognitoId(cognitoId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<UserWithStatus | undefined>;
  updateUser(id: string, userData: Partial<Omit<NewUser, 'id' | 'cognitoId'>>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getUsers(params: GetUsersParams): Promise<GetUsersResult>;
  
  // Method that includes Cognito status for multiple users
  getUsersWithStatus(params: GetUsersParams): Promise<{ users: UserWithStatus[]; total: number }>;
}
