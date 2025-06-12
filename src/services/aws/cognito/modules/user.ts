/**
 * Функції для управління користувачами
 */
import { 
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AttributeType,
  UserNotFoundException,
  UsernameExistsException
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoConfig } from './client';
import { 
  AdminCreateUserParams, 
  AdminCreateUserResult, 
  SetPasswordParams, 
  SetPasswordResult,
  UserAttributes 
} from './types';
import {
  UserNotFoundError,
  UserAlreadyExistsError
} from '../../../../types/errors/auth';

/**
 * Перетворює об'єкт атрибутів користувача в масив AttributeType для AWS SDK
 */
function createAttributeList(email: string, userAttributes?: UserAttributes): AttributeType[] {
  // Базові атрибути, які завжди додаються
  const attributes: AttributeType[] = [
    { Name: 'email', Value: email },
    { Name: 'email_verified', Value: 'true' }
  ];

  // Додаємо додаткові атрибути, якщо вони є
  if (userAttributes) {
    Object.entries(userAttributes).forEach(([key, value]) => {
      if (value) {
        attributes.push({ Name: key, Value: value });
      }
    });
  }

  return attributes;
}

/**
 * Створює нового користувача (адмін API)
 */
export async function adminCreateUser(params: AdminCreateUserParams): Promise<AdminCreateUserResult> {
  const { email, password, userAttributes } = params;
  console.log(`Creating user with email: ${email}`);
  
  try {
    // Створюємо користувача
    const response = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: createAttributeList(email, userAttributes)
      })
    );
    
    console.log('User created successfully');
    
    // Встановлюємо постійний пароль
    await adminSetUserPassword({
      email,
      password,
      permanent: true
    });
    
    // Повертаємо результат з sub користувача
    return {
      success: true,
      userSub: response.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value || ''
    };
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof UsernameExistsException) {
      throw new UserAlreadyExistsError(`User with email ${email} already exists`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }
}

/**
 * Встановлює пароль для користувача (адмін API)
 */
export async function adminSetUserPassword(params: SetPasswordParams): Promise<SetPasswordResult> {
  const { email, password, permanent } = params;
  console.log(`Setting password for user: ${email}`);
  
  try {
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email,
        Password: password,
        Permanent: permanent
      })
    );
    
    console.log('Password set successfully');
    return { success: true };
  } catch (error) {
    console.error('Error setting user password:', error);
    
    if (error instanceof UserNotFoundException) {
      throw new UserNotFoundError(`User with email ${email} not found`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Failed to set user password: ${errorMessage}`);
    }
  }
}
