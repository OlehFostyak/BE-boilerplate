/**
 * Типи та інтерфейси для роботи з Cognito
 */

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface UserAttributes {
  given_name?: string;
  family_name?: string;
  [key: string]: string | undefined;
}

export interface CognitoUserPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  'cognito:username': string;
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

export interface AdminCreateUserParams {
  email: string;
  password: string;
  userAttributes?: UserAttributes;
}

export interface AdminCreateUserResult {
  success: boolean;
  userSub: string;
}

export interface SetPasswordParams {
  email: string;
  password: string;
  permanent: boolean;
}

export interface SetPasswordResult {
  success: boolean;
}
