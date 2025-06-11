// Base class for authentication errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Error for invalid credentials
export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

// Error for user not found
export class UserNotFoundError extends AuthError {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

// Error for user already exists
export class UserAlreadyExistsError extends AuthError {
  constructor(message = 'User already exists') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

// Error for invalid confirmation code
export class InvalidConfirmationCodeError extends AuthError {
  constructor(message = 'Invalid confirmation code') {
    super(message);
    this.name = 'InvalidConfirmationCodeError';
  }
}

// Error for expired token
export class TokenExpiredError extends AuthError {
  constructor(message = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

// Error for invalid token
export class InvalidTokenError extends AuthError {
  constructor(message = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

// Error for unauthorized access
export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Error for password policy violation
export class PasswordPolicyError extends AuthError {
  constructor(message = 'Password does not meet the policy requirements') {
    super(message);
    this.name = 'PasswordPolicyError';
  }
}

// Error for bad request
export class BadRequestError extends AuthError {
  constructor(message = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
  }
}

// Error for user not confirmed
export class UserNotConfirmedError extends AuthError {
  constructor(message = 'User is not confirmed') {
    super(message);
    this.name = 'UserNotConfirmedError';
  }
}
