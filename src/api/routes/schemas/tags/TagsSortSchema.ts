import { z } from 'zod';
import { SortOrderSchema } from 'src/api/routes/schemas/SortSchema';

export const TAG_SORT_FIELDS = ['name', 'createdAt', 'postsCount'] as const;

export const TagsSortSchema = z.object({
  sortBy: z.enum(TAG_SORT_FIELDS).default('createdAt'),
  sortOrder: SortOrderSchema.optional()
});

export type TagSortField = typeof TAG_SORT_FIELDS[number];
