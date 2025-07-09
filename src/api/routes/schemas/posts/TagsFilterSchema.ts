import { z } from 'zod';

export const TagsFilterSchema = z.object({
  tagIds: z.string().uuid().array().optional()
});

export type TagsFilter = z.infer<typeof TagsFilterSchema>;
