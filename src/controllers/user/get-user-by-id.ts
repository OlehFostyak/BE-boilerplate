import { IUserRepo } from 'src/types/users/IUserRepo';
import { HttpError } from 'src/api/errors/HttpError';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

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
    throw new HttpError({
      statusCode: 404,
      message: `User with ID ${userId} not found`,
      errorCode: EErrorCodes.USER_NOT_FOUND
    });
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
