import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string()
});

export const RegisterResponseSchema = z.object({
  message: z.string(),
  success: z.boolean()
});