import { adminCreateUser } from 'src/services/aws/cognito';
import { BadRequestError } from 'src/types/errors/auth';
import { IUserRepo } from 'src/types/users/IUserRepo';

export interface RegisterParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userRepo: IUserRepo;
}

export async function register({ email, password, firstName, lastName, userRepo }: RegisterParams) {
  try {
    const result = await adminCreateUser({
      email,
      password,
      userAttributes: {
        given_name: firstName,
        family_name: lastName
      }
    });

    if (result.userSub) {
      try {
        await userRepo.createUser({
          cognitoId: result.userSub,
          email
        });
      } catch (dbError: any) {
        console.error('Error creating user in database:', dbError);
      }
    }

    return { message: 'User registered successfully.', success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new BadRequestError(error.message || 'Registration failed');
  }
}
