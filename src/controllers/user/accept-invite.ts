import { IUserRepo } from 'src/types/users/IUserRepo';
import { adminSetUserPassword, getUserStatus } from 'src/services/aws/cognito/modules/user';
import { verifySignature } from 'src/services/aws/kms/modules/signature';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';

interface AcceptInviteParams {
  userRepo: IUserRepo;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  expireAt: string;
  signature: string;
}

/**
 * Accept an invitation and complete user registration
 * - Verifies signature
 * - Updates user profile with name
 * - Sets user password in Cognito
 * - Activates user
 */
export async function acceptInvite(params: AcceptInviteParams): Promise<{ success: true }> {
  const { userRepo, email, firstName, lastName, password, expireAt, signature } = params;
  
  try {
    // Verify signature
    const isSignatureValid = await verifySignature(
      { email, expireAt },
      signature
    );
    
    if (!isSignatureValid) {
      throw new HttpError({
      statusCode: 400,
      errorCode: EErrorCodes.INVALID_TOKEN
    });
    }
    
    // Check if invitation has expired
    const expireDate = new Date(expireAt);
    const currentDate = new Date();
    
    if (currentDate > expireDate) {
      throw new HttpError({
      statusCode: 400,
      errorCode: EErrorCodes.EXPIRED_TOKEN
    });
    }
    
    // Get user from database
    const user = await userRepo.getUserByEmail(email);
    
    if (!user) {
      throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.USER_NOT_FOUND
    });
    }
    
    // Check if user is already active in Cognito
    const userStatus = await getUserStatus({ email });
    if (!userStatus.success) {
      throw new HttpError({
      statusCode: 500,
      errorCode: EErrorCodes.GENERAL_ERROR
    });
    }
    
    if (userStatus.success && userStatus.status !== 'FORCE_CHANGE_PASSWORD') {
      throw new HttpError({
      statusCode: 400,
      errorCode: EErrorCodes.USER_INVALID_STATUS
    });
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
      success: true
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw new HttpError({
      statusCode: 400,
      cause: error,
      errorCode: EErrorCodes.USER_ACTIVATION_FAILED
    });
  }
}
