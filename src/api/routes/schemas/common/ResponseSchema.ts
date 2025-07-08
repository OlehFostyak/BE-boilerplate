import { z } from 'zod';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

/**
 * Base schema for successful API responses
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true)
});

/**
 * Base schema for error API responses
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  errorCode: z.nativeEnum(EErrorCodes)
});

/**
 * Generic API response schema that can be either success or error
 */
export const ApiResponseSchema = z.union([
  SuccessResponseSchema,
  ErrorResponseSchema
]);

/**
 * Helper function to create a success response schema with data
 * @param dataSchema Schema for the data property
 * @returns Zod schema for success response with data
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return SuccessResponseSchema.extend({
    data: dataSchema
  });
}

/**
 * Type for API response
 */
export type ApiResponse<T = undefined> = 
  | { success: true; data?: T }
  | { success: false; errorCode: EErrorCodes };
