import { signIn } from 'src/services/aws/cognito';
import { BadRequestError } from 'src/types/errors/auth';

export interface LoginParams {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginParams) {
  try {
    const result = await signIn({
      email,
      password
    });
    
    if (!result.accessToken || !result.idToken || !result.refreshToken) {
      throw new Error('Authentication successful but tokens are missing');
    }
    
    return {
      success: result.success,
      accessToken: result.accessToken,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new BadRequestError(error.message || 'Login failed');
  }
}
