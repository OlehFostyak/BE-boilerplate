import { z } from 'zod';
import { SortOrderSchema } from '../SortSchema';

export const POST_SORT_FIELDS = ['title', 'createdAt', 'commentsCount'] as const;

export const PostsSortSchema = z.object({
  sortBy: z.enum(POST_SORT_FIELDS).default('createdAt'),
  sortOrder: SortOrderSchema.optional()
});

export type PostSortField = typeof POST_SORT_FIELDS[number];
