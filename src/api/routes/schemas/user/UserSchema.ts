import { z } from 'zod';

// User profile response schema
export const UserProfileResponseSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  role: z.string().optional()
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string()
});

// Get user by ID params schema
export const getUserByIdParams = z.object({
  userId: z.string()
});

// Get user profile route configuration
export const getUserProfileRoute = {
  schema: {
    response: {
      200: UserProfileResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

// Get user by ID route configuration
export const getUserByIdRoute = {
  schema: {
    params: getUserByIdParams,
    response: {
      200: UserProfileResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

// Type for route parameters
export type GetUserByIdParams = z.infer<typeof getUserByIdParams>;
