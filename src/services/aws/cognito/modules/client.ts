/**
 * Client for working with AWS Cognito
 */
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from 'src/services/aws/config';
import { env } from 'src/services/env/index';

// Create a single instance of Cognito client
export const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

// Export configuration variables for convenient access
export const cognitoConfig = {
  userPoolId: env.AWS_COGNITO_USER_POOL_ID,
  clientId: env.AWS_COGNITO_CLIENT_ID
};
