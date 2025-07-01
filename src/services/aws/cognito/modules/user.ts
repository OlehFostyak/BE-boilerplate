/**
 * Functions for user management
 */
import { 
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  GetUserCommand,
  AttributeType,
  UserNotFoundException,
  UsernameExistsException,
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoConfig } from './client';
import { 
  AdminCreateUserParams, 
  AdminCreateUserResult, 
  SetPasswordParams, 
  SetPasswordResult,
  DisableUserParams,
  DisableUserResult,
  EnableUserParams,
  EnableUserResult,
  GetUserStatusParams,
  GetUserStatusResult,
  UserAttributes,
  CognitoUserPayload 
} from './types';
import {
  UserNotFoundError,
  UserAlreadyExistsError
} from 'src/types/errors/auth';
import { randomUUID } from 'crypto';

/**
 * Converts user attributes object to AttributeType array for AWS SDK
 */
function createAttributeList(email: string, userAttributes?: UserAttributes): AttributeType[] {
  // Basic attributes that are always added
  const attributes: AttributeType[] = [
    { Name: 'email', Value: email },
    { Name: 'email_verified', Value: 'true' }
  ];

  // Add additional attributes if they exist
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
 * Creates a new user (admin API)
 */
export async function adminCreateUser(
  params: AdminCreateUserParams
): Promise<AdminCreateUserResult> {
  const { email, password, userAttributes } = params;
  console.log(`Creating user: ${email}`);
  
  try {
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
    
    // Set permanent password
    await adminSetUserPassword({
      email,
      password,
      permanent: true
    });
    
    // Return result with user's sub
    const subAttribute = response.User?.Attributes?.find(attr => attr.Name === 'sub');
    return { success: true, userSub: subAttribute?.Value || '' };
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
 * Creates a new user without setting a permanent password (admin API)
 * This is useful for invitation flows where the user will set their own password later
 */
export async function adminCreateUserWithoutPassword(
  email: string
): Promise<AdminCreateUserResult> {
  console.log(`Creating user without permanent password: ${email}`);
  
  try {
    const response = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email,
        MessageAction: 'SUPPRESS'
      })
    );
    
    console.log('User created successfully (without permanent password)');
    
    // Return result with user's sub
    const subAttribute = response.User?.Attributes?.find(attr => attr.Name === 'sub');
    return { success: true, userSub: subAttribute?.Value || '' };
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
 * Sets password for user (admin API)
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

/**
 * Gets user data by access token
 * If token is valid, returns user data
 * If token is invalid, throws an error
 */
/**
 * Disables a user in Cognito (admin API)
 */
export async function adminDisableUser(params: DisableUserParams): Promise<DisableUserResult> {
  const { email } = params;
  console.log(`Disabling user: ${email}`);
  
  try {
    await cognitoClient.send(
      new AdminDisableUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email
      })
    );
    
    console.log('User disabled successfully');
    return { success: true };
  } catch (error) {
    console.error('Error disabling user:', error);
    
    if (error instanceof UserNotFoundException) {
      throw new UserNotFoundError(`User with email ${email} not found`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Failed to disable user: ${errorMessage}`);
    }
  }
}

/**
 * Enables a user in Cognito (admin API)
 */
export async function adminEnableUser(params: EnableUserParams): Promise<EnableUserResult> {
  const { email } = params;
  console.log(`Enabling user: ${email}`);
  
  try {
    await cognitoClient.send(
      new AdminEnableUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email
      })
    );
    
    console.log('User enabled successfully');
    return { success: true };
  } catch (error) {
    console.error('Error enabling user:', error);
    
    if (error instanceof UserNotFoundException) {
      throw new UserNotFoundError(`User with email ${email} not found`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Failed to enable user: ${errorMessage}`);
    }
  }
}

/**
 * Gets user status from Cognito
 * @param params Parameters containing the user's email
 * @returns User status information
 */
export async function getUserStatus(params: GetUserStatusParams): Promise<GetUserStatusResult> {
  const { email } = params;
  console.log(`Getting status for user: ${email}`);
  
  try {
    const response = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email
      })
    );
    
    return {
      success: true,
      status: response.UserStatus,
      enabled: response.Enabled
    };
  } catch (error) {
    console.error('Error getting user status:', error);
    
    if (error instanceof UserNotFoundException) {
      return {
        success: false,
        error: `User with email ${email} not found`
      };
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown';
      return {
        success: false,
        error: `Failed to get user status: ${errorMessage}`
      };
    }
  }
}

/**
 * Gets user data by access token
 * If token is valid, returns user data
 * If token is invalid, throws an error
 */
export async function getUserByToken(token: string): Promise<CognitoUserPayload> {
  try {
    // Send request to AWS Cognito
    const response = await cognitoClient.send(
      new GetUserCommand({ AccessToken: token })
    );
    
    if (!response.UserAttributes) {
      throw new Error('User attributes not found');
    }
    
    // Create base user object
    const userPayload: CognitoUserPayload = {
      sub: '',
      email: '',
      email_verified: false,
      'cognito:username': response.Username || ''
    };
    
    // Fill data from attributes
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
    console.error('Error getting user by token:', error);
    
    if (error instanceof NotAuthorizedException) {
      throw new Error('Invalid or expired token');
    }
    
    throw new Error('Failed to get user by token');
  }
}
