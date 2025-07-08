import { z } from 'zod';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

// Schema for invite user request
export const InviteUserReqSchema = z.object({
  email: z.string().email('Invalid email format')
});

// Schema for invite user response
export const InviteUserRespSchema = z.object({
  success: z.boolean(),
  errorCode: z.nativeEnum(EErrorCodes).optional(),
  userId: z.string().uuid().optional()
});

// Schema for resend invitation request params
export const ResendInviteParamsSchema = z.object({
  userId: z.string()
});

// Schema for resend invitation response
export const ResendInviteRespSchema = z.object({
  success: z.boolean(),
  errorCode: z.nativeEnum(EErrorCodes).optional()
});

// Schema for accept invite request
export const AcceptInviteReqSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  expireAt: z.string(),
  signature: z.string()
});

// Schema for accept invite response
export const AcceptInviteRespSchema = z.object({
  success: z.boolean(),
  errorCode: z.nativeEnum(EErrorCodes).optional()
});
