import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '../config';
import { env } from '../../env/index';

// Create a Cognito client
const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

export interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ConfirmSignUpParams {
  email: string;
  confirmationCode: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ConfirmForgotPasswordParams {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

export class CognitoService {
  private readonly clientId: string;
  private readonly userPoolId: string;

  constructor() {
    this.clientId = env.AWS_COGNITO_CLIENT_ID;
    this.userPoolId = env.AWS_COGNITO_USER_POOL_ID;
  }

  /**
   * Register a new user in Cognito
   */
  async signUp({ email, password, firstName, lastName }: SignUpParams) {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'given_name',
          Value: firstName,
        },
        {
          Name: 'family_name',
          Value: lastName,
        },
      ],
    });

    try {
      const response = await cognitoClient.send(command);
      return {
        success: true,
        userSub: response.UserSub || '',
        userConfirmed: response.UserConfirmed,
      };
    } catch (error) {
      console.error('Error signing up user:', error);
      throw error;
    }
  }

  /**
   * Confirm a user's registration with the confirmation code
   */
  async confirmSignUp({ email, confirmationCode }: ConfirmSignUpParams) {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    try {
      await cognitoClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    }
  }

  /**
   * Sign in a user and get tokens
   */
  async signIn({ email, password }: SignInParams) {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    try {
      const response = await cognitoClient.send(command);
      return {
        success: true,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        idToken: response.AuthenticationResult?.IdToken,
        expiresIn: response.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword({ email }: ForgotPasswordParams) {
    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
    });

    try {
      await cognitoClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error initiating forgot password:', error);
      throw error;
    }
  }

  /**
   * Confirm new password with confirmation code
   */
  async confirmForgotPassword({ email, confirmationCode, newPassword }: ConfirmForgotPasswordParams) {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    try {
      await cognitoClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error confirming new password:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const cognitoService = new CognitoService();
