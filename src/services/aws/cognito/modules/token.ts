/**
 * Функції для роботи з токенами
 */
import { 
  GetUserCommand,
  GetUserCommandOutput,
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './client';
import { CognitoUserPayload } from './types';

/**
 * Перевіряє токен доступу через AWS Cognito API
 * @param token JWT токен доступу
 * @returns Дані користувача
 */
export async function verifyToken(token: string): Promise<CognitoUserPayload> {
  try {
    // Відправляємо запит до AWS Cognito
    const response = await cognitoClient.send(
      new GetUserCommand({ AccessToken: token })
    );
    
    if (!response.UserAttributes) {
      throw new Error('User attributes not found');
    }
    
    // Створюємо базовий об'єкт користувача
    const userPayload: CognitoUserPayload = {
      sub: '',
      email: '',
      email_verified: false,
      'cognito:username': response.Username || ''
    };
    
    // Заповнюємо дані з атрибутів
    response.UserAttributes.forEach(attr => {
      if (attr.Name && attr.Value) {
        if (attr.Name === 'email_verified') {
          userPayload[attr.Name] = attr.Value.toLowerCase() === 'true';
        } else {
          userPayload[attr.Name] = attr.Value;
        }
      }
    });
    
    return userPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    
    if (error instanceof NotAuthorizedException) {
      throw new Error('Invalid or expired token');
    }
    
    throw new Error('Failed to verify token');
  }
}
