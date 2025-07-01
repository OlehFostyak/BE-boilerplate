import { adminEnableUser } from 'src/services/aws/cognito/modules/user';
import { UserNotFoundError } from 'src/types/errors/auth';
import { UserOperationParams } from 'src/types/users/User';

export async function activateUser(params: UserOperationParams) {
  const { userRepo, userId } = params;

  // Get user from database
  const user = await userRepo.getUserById(userId);
  if (!user) {
    throw new UserNotFoundError(`User with ID ${userId} not found`);
  }

  try {
    // Enable user in Cognito
    await adminEnableUser({
      email: user.email
    });

    // Note: User status is managed by Cognito
    // No need to update any status in the database

    return {
      success: true,
      message: `User ${user.email} has been activated`
    };
  } catch (error) {
    console.error('Error activating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown';
    throw new Error(`Failed to activate user: ${errorMessage}`);
  }
}
