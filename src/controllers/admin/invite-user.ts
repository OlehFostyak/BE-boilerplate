import { IUserRepo } from 'src/types/users/IUserRepo';
import { adminCreateUserWithoutPassword } from 'src/services/aws/cognito/modules/user';
import { generateSignature } from 'src/services/aws/kms/modules/signature';
import { sendInviteEmail } from 'src/services/sendgrid/modules/email';
import { randomUUID } from 'crypto';

interface InviteUserParams {
  userRepo: IUserRepo;
  email: string;
}

interface InviteUserResult {
  success: boolean;
  message: string;
  userId?: string;
}

/**
 * Invite a new user
 * - Creates user in Cognito with temporary password
 * - Creates user in database
 * - Sends invitation email with signup link
 */
export async function inviteUser(params: InviteUserParams): Promise<InviteUserResult> {
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
      message: `Invitation sent to ${email}`,
      userId: newUser.id
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    return {
      success: false,
      message: `Failed to invite user: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
