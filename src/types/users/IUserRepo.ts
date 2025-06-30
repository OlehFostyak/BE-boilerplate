import { User, NewUser } from 'src/types/User';
import { GetUsersResult } from 'src/types/users/User';

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
  getUserById(id: string): Promise<User | undefined>;
  getUserByCognitoId(cognitoId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, userData: Partial<Omit<NewUser, 'id' | 'cognitoId'>>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getUsers(params: GetUsersParams): Promise<GetUsersResult>;
}
