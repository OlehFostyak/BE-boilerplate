import { z } from 'zod';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string()
});

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  errorCode: z.nativeEnum(EErrorCodes).optional()
});