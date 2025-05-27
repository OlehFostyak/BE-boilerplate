import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  postId: z.string().uuid(),
  updatedAt: z.date(),
  createdAt: z.date()
});

export type Comment = z.infer<typeof CommentSchema>;