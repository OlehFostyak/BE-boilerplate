import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

export const RegisterResponseSchema = z.object({
  message: z.string(),
  success: z.boolean()
});