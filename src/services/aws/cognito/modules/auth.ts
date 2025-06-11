/**
 * Functions for user authentication
 */
import { 
  InitiateAuthCommand, 
  AuthFlowType,
  NotAuthorizedException,
  UserNotFoundException,
  UserNotConfirmedException
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoConfig } from './client';
import { SignInParams, SignInResult } from './types';
import {
  InvalidCredentialsError,
  UserNotFoundError,
  UserNotConfirmedError
} from 'src/types/errors/auth';

/**
 * User sign-in to the system
 * @param params Sign-in parameters (email, password)
 * @returns Sign-in result with tokens
 */
export async function signIn({ email, password }: SignInParams): Promise<SignInResult> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: cognitoConfig.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    });

    const response = await cognitoClient.send(command);
    
    return {
      success: true,
      accessToken: response.AuthenticationResult?.AccessToken,
      idToken: response.AuthenticationResult?.IdToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
      expiresIn: response.AuthenticationResult?.ExpiresIn
    };
  } catch (error) {
    console.error('Error signing in:', error);
    
    if (error instanceof NotAuthorizedException) {
      throw new InvalidCredentialsError('Invalid email or password');
    } else if (error instanceof UserNotFoundException) {
      throw new UserNotFoundError(`User with email ${email} not found`);
    } else if (error instanceof UserNotConfirmedException) {
      throw new UserNotConfirmedError(`User with email ${email} is not confirmed`);
    } else {
      const errorMsg = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Failed to sign in: ${errorMsg}`);
    }
  }
}
