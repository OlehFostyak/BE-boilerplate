import { z } from 'zod';

export const ArchivedTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  postsCount: z.number().optional()
});

export type ArchivedTag = z.infer<typeof ArchivedTagSchema>;

export interface GetArchivedTagsResult {
  tags: ArchivedTag[];
  total: number;
}
