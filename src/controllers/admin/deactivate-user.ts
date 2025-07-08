import { adminDisableUser } from 'src/services/aws/cognito/modules/user';
import { UserOperationParams } from 'src/types/users/User';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';

export async function deactivateUser(params: UserOperationParams): Promise<{ success: true }> {
  const { userRepo, userId } = params;

  try {
    // Get user from database
    const user = await userRepo.getUserById(userId);
    if (!user) {
      throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.USER_NOT_FOUND
    });
    }

    // Disable user in Cognito
    await adminDisableUser({
      email: user.email
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new HttpError({
      statusCode: 400,
      cause: error,
      errorCode: EErrorCodes.USER_DEACTIVATION_FAILED
    });
  }
}
