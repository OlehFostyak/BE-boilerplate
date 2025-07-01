import { UserInviteResult, InviteUserParams, ResendInviteParams } from 'src/types/users/User';
import { adminCreateUserWithoutPassword, getUserStatus } from 'src/services/aws/cognito/modules/user';
import { generateSignature } from 'src/services/aws/kms/modules/signature';
import { sendInviteEmail } from 'src/services/sendgrid/modules/email';

/**
 * Helper function to send user invitation
 * - Generates signature with expiration
 * - Creates invite URL
 * - Sends email
 */
async function sendUserInvitation(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Generate signature with expiration date
    const { signature, expireAt } = await generateSignature(email);
    
    // Create invite URL
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?email=${encodeURIComponent(email)}&expireAt=${encodeURIComponent(expireAt)}&signature=${encodeURIComponent(signature)}`;
    
    // Send invitation email
    await sendInviteEmail({
      email,
      inviteUrl
    });
    
    return {
      success: true,
      message: `Invitation sent to ${email}`
    };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return {
      success: false,
      message: `Failed to send invitation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Invite a new user
 * - Creates user in Cognito with temporary password
 * - Creates user in database
 * - Sends invitation email with signup link
 */
export async function inviteUser(params: InviteUserParams): Promise<UserInviteResult> {
  const { userRepo, email } = params;
  
  try {
    // Check if user already exists
    const existingUser = await userRepo.getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        message: `User with email ${email} already exists`
      };
    }

    // Create user in Cognito without setting permanent password
    const cognitoResult = await adminCreateUserWithoutPassword(email);
    
    if (!cognitoResult.success || !cognitoResult.userSub) {
      return {
        success: false,
        message: 'Failed to create user in Cognito'
      };
    }
    
    // Create user in database
    const newUser = await userRepo.createUser({
      email,
      firstName: '',
      lastName: '',
      cognitoId: cognitoResult.userSub
    });
    
    // Send invitation email
    const inviteResult = await sendUserInvitation(email);
    
    if (inviteResult.success) {
      return {
        success: true,
        message: `Invitation sent to ${email}`,
        userId: newUser.id
      };
    } else {
      throw new Error(inviteResult.message);
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    return {
      success: false,
      message: `Failed to invite user: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Resend invitation to a user
 * - Generates new signature and expiration
 * - Sends new invitation email
 */
export async function resendInvite(params: ResendInviteParams): Promise<UserInviteResult> {
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
    
    // Send invitation email
    const inviteResult = await sendUserInvitation(user.email);
    
    if (inviteResult.success) {
      return {
        success: true,
        message: `Invitation resent to ${user.email}`
      };
    } else {
      throw new Error(inviteResult.message);
    }  
  } catch (error) {
    console.error('Error resending invitation:', error);
    return {
      success: false,
      message: `Failed to resend invitation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
