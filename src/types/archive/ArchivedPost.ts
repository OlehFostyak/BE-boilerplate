import { z } from 'zod';
import { UserSchema } from '../users/UserSchema';
import { TagSchema } from '../tags/Tag';

export const ArchivedPostSchema = z.object({
  id: z.string().uuid(),
  originalId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  archivedAt: z.date(),
  user: UserSchema.optional(),
  commentsCount: z.number().optional(),
  tags: z.array(TagSchema).optional()
});

export type ArchivedPost = z.infer<typeof ArchivedPostSchema>;

export interface GetArchivedPostsResult {
  posts: ArchivedPost[];
  total: number;
}
