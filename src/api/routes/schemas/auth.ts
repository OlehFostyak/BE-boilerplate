import { z } from 'zod';

// Registration schema
export const registerSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
  }),
  response: {
    200: z.object({
      success: z.boolean(),
      userSub: z.string(),
      userConfirmed: z.boolean().optional()
    })
  }
};

// Confirm registration schema
export const confirmRegistrationSchema = {
  body: z.object({
    email: z.string().email(),
    confirmationCode: z.string()
  }),
  response: {
    200: z.object({
      success: z.boolean()
    })
  }
};

// Login schema
export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string()
  }),
  response: {
    200: z.object({
      success: z.boolean(),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      idToken: z.string().optional(),
      expiresIn: z.number().optional()
    })
  }
};

// Forgot password schema
export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email()
  }),
  response: {
    200: z.object({
      success: z.boolean()
    })
  }
};

// Reset password schema
export const resetPasswordSchema = {
  body: z.object({
    email: z.string().email(),
    confirmationCode: z.string(),
    newPassword: z.string().min(8)
  }),
  response: {
    200: z.object({
      success: z.boolean()
    })
  }
};
