/**
 * Essential types for AWS Cognito integration
 * 
 * Only includes types that are specific to the Cognito implementation
 * and can't be easily replaced with application-level types.
 */
import { IdentityUser } from 'src/types/IdentityUser';

// Auth params and results
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

// User attributes for Cognito
export interface UserAttributes {
  given_name?: string;
  family_name?: string;
  [key: string]: string | undefined;
}

// Extended version of IdentityUser with Cognito-specific fields
export interface CognitoUserPayload extends Omit<IdentityUser, 'subId'> {
  sub: string; // equivalent to subId in IdentityUser
  email_verified: boolean;
  'cognito:username': string;
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

// Admin operations
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

export interface DisableUserParams {
  email: string;
}

export interface DisableUserResult {
  success: boolean;
}

export interface EnableUserParams {
  email: string;
}

export interface EnableUserResult {
  success: boolean;
}
