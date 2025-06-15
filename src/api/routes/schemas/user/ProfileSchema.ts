import { z } from 'zod';

export const UserProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable()
});

export const ErrorResponseSchema = z.object({
  error: z.string()
});
