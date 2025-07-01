import { IUserRepo } from 'src/types/users/IUserRepo';
import { adminSetUserPassword, getUserStatus } from 'src/services/aws/cognito/modules/user';
import { verifySignature } from 'src/services/aws/kms/modules/signature';

interface AcceptInviteParams {
  userRepo: IUserRepo;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  expireAt: string;
  signature: string;
}

interface AcceptInviteResult {
  success: boolean;
  message: string;
}

/**
 * Accept an invitation and complete user registration
 * - Verifies signature
 * - Updates user profile with name
 * - Sets user password in Cognito
 * - Activates user
 */
export async function acceptInvite(params: AcceptInviteParams): Promise<AcceptInviteResult> {
  const { userRepo, email, firstName, lastName, password, expireAt, signature } = params;
  
  try {
    // Verify signature
    const isSignatureValid = await verifySignature(
      { email, expireAt },
      signature
    );
    
    if (!isSignatureValid) {
      return {
        success: false,
        message: 'Invalid signature'
      };
    }
    
    // Check if invitation has expired
    const expireDate = new Date(expireAt);
    const currentDate = new Date();
    
    if (currentDate > expireDate) {
      return {
        success: false,
        message: 'Invitation has expired'
      };
    }
    
    // Get user from database
    const user = await userRepo.getUserByEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: `User with email ${email} not found`
      };
    }
    
    // Check if user is already active in Cognito
    const userStatus = await getUserStatus({ email });
    if (userStatus.success && userStatus.status !== 'FORCE_CHANGE_PASSWORD') {
      return {
        success: false,
        message: 'User is already active or in an invalid state'
      };
    }
    
    // Set password in Cognito
    await adminSetUserPassword({
      email,
      password,
      permanent: true
    });
    
    // Update user in database with name information
    await userRepo.updateUser(user.id, {
      firstName,
      lastName
    });
    
    return {
      success: true,
      message: 'Registration completed successfully'
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return {
      success: false,
      message: `Failed to accept invitation: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
