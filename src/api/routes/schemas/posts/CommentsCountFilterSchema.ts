import { z } from 'zod';
import { COUNT_OPERATORS } from 'src/services/drizzle/utils/filtering';

export const CommentsCountFilterSchema = z.object({
  commentsCountOperator: z.enum(COUNT_OPERATORS).optional(),
  commentsCountValue: z.string().optional().transform(val => val ? Number(val) : undefined)
});
