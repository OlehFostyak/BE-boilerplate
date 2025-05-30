import { z } from 'zod';

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
  commentsCount: z.number().optional(),
  updatedAt: z.date(),
  createdAt: z.date()
});

export interface GetPostsResult {
  posts: Post[];
  total: number;
}

export type Post = z.infer<typeof PostSchema>;