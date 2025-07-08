import { adminCreateUser } from 'src/services/aws/cognito';
import { IUserRepo } from 'src/types/users/IUserRepo';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';

export interface RegisterParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userRepo: IUserRepo;
}

export async function register({ email, password, firstName, lastName, userRepo }: RegisterParams): Promise<{ success: boolean; userId?: string }> {
  try {
    const result = await adminCreateUser({
      email,
      password,
      userAttributes: {
        given_name: firstName,
        family_name: lastName
      }
    });

    if (result.success) {
      try {
        const user = await userRepo.createUser({
          cognitoId: result.userSub,
          email,
          firstName,
          lastName
        });
        
        return {
          success: true,
          userId: user.id
        };
      } catch (dbError: any) {
        console.error('Error creating user in database:', dbError);
      }
    }
    
    return { success: false };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new HttpError({
      statusCode: 400,
      cause: error,
      errorCode: EErrorCodes.USER_CREATION_FAILED
    });
  }
}
