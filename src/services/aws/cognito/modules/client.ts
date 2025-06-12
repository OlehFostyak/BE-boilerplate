/**
 * Клієнт для роботи з AWS Cognito
 */
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '../../config';
import { env } from '../../../env/index';

// Створюємо єдиний екземпляр клієнта Cognito
export const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

// Експортуємо конфігураційні змінні для зручного доступу
export const cognitoConfig = {
  userPoolId: env.AWS_COGNITO_USER_POOL_ID,
  clientId: env.AWS_COGNITO_CLIENT_ID
};
