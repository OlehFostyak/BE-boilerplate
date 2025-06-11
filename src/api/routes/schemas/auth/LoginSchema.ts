import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  idToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional()
});
