import { z } from 'zod';
import { UserSchema } from '../users/UserSchema';

export const ArchivedCommentSchema = z.object({
  id: z.string().uuid(),
  originalId: z.string().uuid(),
  text: z.string(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  archivedAt: z.date(),
  user: UserSchema.optional()
});

export type ArchivedComment = z.infer<typeof ArchivedCommentSchema>;

export interface GetArchivedCommentsResult {
  comments: ArchivedComment[];
  total: number;
}
