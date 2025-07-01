import { z } from 'zod';
import { PaginatedResponseSchema } from 'src/api/routes/schemas/PaginationSchema';

// Base user schema for admin view
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  cognitoId: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  role: z.string(),
  // Cognito status fields
  status: z.string().optional(),
  enabled: z.boolean().optional()
});

// Response schema for getting users
export const GetUsersAdminRespSchema = PaginatedResponseSchema(AdminUserSchema);

// Search schema for users
export const UserSearchSchema = z.object({
  search: z.string().optional()
});

// Query schema for user operations with userId
export const UserIdQuerySchema = z.object({
  userId: z.string()
});

// Response schema for user operations
export const UserOperationRespSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

// Aliases for backward compatibility
export const DeactivateUserRespSchema = UserOperationRespSchema;
export const ActivateUserRespSchema = UserOperationRespSchema;

// Error response schema
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string()
});
