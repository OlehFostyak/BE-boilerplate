import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional()
});

export const PaginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  page: z.number(),
  totalPages: z.number()
});

// Generic paginated response schema for any data type
export const PaginatedResponseSchema = <T extends z.ZodType>(schema: T) => z.object({
  data: z.array(schema),
  meta: PaginationMetaSchema
});
