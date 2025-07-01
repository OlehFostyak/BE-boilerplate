import { IUserRepo } from 'src/types/users/IUserRepo';
import { HttpError } from 'src/api/errors/HttpError';

export interface GetUserByIdParams {
  userRepo: IUserRepo;
  userId: string;
}

/**
 * Get a user by ID
 * @param params - The parameters for getting a user by ID
 * @returns The user if found
 * @throws HttpError with status 404 if user not found
 */
export async function getUserById(params: GetUserByIdParams) {
  const { userRepo, userId } = params;

  // getUserById now includes Cognito status
  const user = await userRepo.getUserById(userId);
  if (!user) {
    throw new HttpError(404, `User with ID ${userId} not found`);
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    enabled: user.enabled
  };
}
