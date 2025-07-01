import { adminDisableUser } from 'src/services/aws/cognito/modules/user';
import { UserNotFoundError } from 'src/types/errors/auth';
import { UserOperationParams } from 'src/types/users/User';

export async function deactivateUser(params: UserOperationParams) {
  const { userRepo, userId } = params;

  // Get user from database
  const user = await userRepo.getUserById(userId);
  if (!user) {
    throw new UserNotFoundError(`User with ID ${userId} not found`);
  }

  try {
    // Disable user in Cognito
    await adminDisableUser({
      email: user.email
    });
    
    return {
      success: true,
      message: `User ${user.email} has been deactivated`
    };
  } catch (error) {
    console.error('Error deactivating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown';
    throw new Error(`Failed to deactivate user: ${errorMessage}`);
  }
}
