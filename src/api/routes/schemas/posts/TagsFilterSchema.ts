import { z } from 'zod';

export const TagsFilterSchema = z.object({
  tagIds: z.union([
    z.string().uuid().array(),
    z.string().uuid().transform(val => [val])
  ]).optional()
});

export type TagsFilter = z.infer<typeof TagsFilterSchema>;
