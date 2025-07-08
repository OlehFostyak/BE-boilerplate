import { UserInviteResult, InviteUserParams, ResendInviteParams } from 'src/types/users/User';
import { adminCreateUserWithoutPassword, getUserStatus } from 'src/services/aws/cognito/modules/user';
import { generateSignature } from 'src/services/aws/kms/modules/signature';
import { sendInviteEmail } from 'src/services/sendgrid/modules/email';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';

/**
 * Helper function to send user invitation
 * - Generates signature with expiration
 * - Creates invite URL
 * - Sends email
 */
async function sendUserInvitation(email: string): Promise<{ success: boolean; errorCode?: EErrorCodes }> {
  try {
    // Generate signature with expiration date
    const { signature, expireAt } = await generateSignature(email);
    
    // Create invite URL
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?email=${encodeURIComponent(email)}&expireAt=${encodeURIComponent(expireAt)}&signature=${encodeURIComponent(signature)}`;
    
    // Send invitation email
    await sendInviteEmail(email, inviteUrl);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw new HttpError({
      statusCode: 400,
      cause: error,
      errorCode: EErrorCodes.GENERAL_ERROR
    });
  }
}

/**
 * Invite a new user
 * - Creates user in Cognito with temporary password
 * - Creates user in database
 * - Sends invitation email with signup link
 */
export async function inviteUser(params: InviteUserParams): Promise<{ success: true; userId: string }> {
  const { userRepo, email } = params;
  
  try {
    // Check if user already exists
    const existingUser = await userRepo.getUserByEmail(email);
    if (existingUser) {
      throw new HttpError({
      statusCode: 409,
      errorCode: EErrorCodes.USER_ALREADY_EXISTS
    });
    }

    // Create user in Cognito without setting permanent password
    const cognitoResult = await adminCreateUserWithoutPassword(email);
    
    if (!cognitoResult.success || !cognitoResult.userSub) {
      throw new HttpError({
      statusCode: 400,
      errorCode: EErrorCodes.GENERAL_ERROR
    });
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
        userId: newUser.id
      };
    } else {
      throw new HttpError({
      statusCode: 422,
      errorCode: inviteResult.errorCode || EErrorCodes.GENERAL_ERROR
    });
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    throw new HttpError({
      statusCode: 400,
      cause: error,
      errorCode: EErrorCodes.USER_INVITE_FAILED
    });
  }
}

/**
 * Resend invitation to a user
 * - Generates new signature and expiration
 * - Sends new invitation email
 */
export async function resendInvite(params: ResendInviteParams): Promise<{ success: true }> {
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
    
    // Check user status in Cognito
    const userStatus = await getUserStatus({ email: user.email });
    if (!userStatus.success) {
      throw new HttpError({
        statusCode: 400,
        errorCode: EErrorCodes.GENERAL_ERROR
      });
    }
    
    // Only resend invite if user is in FORCE_CHANGE_PASSWORD status
    if (userStatus.status !== 'FORCE_CHANGE_PASSWORD') {
      throw new HttpError({
        statusCode: 400,
        errorCode: EErrorCodes.USER_INVALID_STATUS
      });
    }
    
    // Send invitation email
    const inviteResult = await sendUserInvitation(user.email);
    
    if (inviteResult.success) {
      return {
        success: true
      };
    } else {
      throw new HttpError({
        statusCode: 422,
        message: 'Failed to send invitation email',
        errorCode: inviteResult.errorCode || EErrorCodes.GENERAL_ERROR
      });
    }  
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw new HttpError({
      statusCode: 400,
      cause: error,
      errorCode: EErrorCodes.USER_INVITE_RESEND_FAILED
    });
  }
}
