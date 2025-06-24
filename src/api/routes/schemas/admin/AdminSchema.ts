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
  isActive: z.boolean(),
  role: z.string()
});

// Response schema for getting users
export const GetUsersAdminRespSchema = PaginatedResponseSchema(AdminUserSchema);

// Search schema for users
export const UserSearchSchema = z.object({
  search: z.string().optional()
});

// Request schema for deactivating a user
export const DeactivateUserReqSchema = z.object({
  userId: z.string()
});

// Response schema for deactivating a user
export const DeactivateUserRespSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

// Error response schema
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string()
});
