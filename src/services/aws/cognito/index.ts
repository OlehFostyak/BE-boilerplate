/**
 * AWS Cognito Service
 * 
 * Modular approach to working with AWS Cognito.
 * Each functionality is moved to a separate module for better readability and maintainability.
 */

// Export types and interfaces
export * from './modules/types';

// Export client and configuration
export * from './modules/client';

// Export functions for working with tokens moved to user.ts

// Export functions for authentication
export * from './modules/auth';

// Export functions for user management
export * from './modules/user';

