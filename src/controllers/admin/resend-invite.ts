import { IUserRepo } from 'src/types/users/IUserRepo';
import { generateSignature } from 'src/services/aws/kms/modules/signature';
import { sendInviteEmail } from 'src/services/sendgrid/modules/email';
import { getUserStatus } from 'src/services/aws/cognito/modules/user';

interface ResendInviteParams {
  userRepo: IUserRepo;
  userId: string;
}

interface ResendInviteResult {
  success: boolean;
  message: string;
}

/**
 * Resend invitation to a user
 * - Generates new signature and expiration
 * - Sends new invitation email
 */
export async function resendInvite(params: ResendInviteParams): Promise<ResendInviteResult> {
  const { userRepo, userId } = params;
  
  try {
    // Get user from database
    const user = await userRepo.getUserById(userId);
    
    if (!user) {
      return {
        success: false,
        message: `User with ID ${userId} not found`
      };
    }
    
    // Check user status in Cognito
    const userStatus = await getUserStatus({ email: user.email });
    if (!userStatus.success) {
      return {
        success: false,
        message: `Failed to get status for user ${user.email}: ${userStatus.error}`
      };
    }
    
    // Only resend invite if user is in FORCE_CHANGE_PASSWORD status
    if (userStatus.status !== 'FORCE_CHANGE_PASSWORD') {
      return {
        success: false,
        message: `Cannot resend invite to user ${user.email} with status ${userStatus.status}`
      };
    }
    
    // Generate signature with expiration date
    const { signature, expireAt } = await generateSignature(user.email);
    
    // Create invite URL
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?email=${encodeURIComponent(user.email)}&expireAt=${encodeURIComponent(expireAt)}&signature=${encodeURIComponent(signature)}`;
    
    // Send invitation email
    await sendInviteEmail({
      email: user.email,
      inviteUrl
    });
    
    return {
      success: true,
      message: `Invitation resent to ${user.email}`
    };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return {
      success: false,
      message: `Failed to resend invitation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
