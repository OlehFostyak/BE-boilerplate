import { z } from 'zod';
import { IPostRepo } from './IPostRepo';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';
import { CountOperator } from 'src/services/drizzle/utils/filtering';
import { UserProfileResponseSchema } from 'src/api/routes/schemas/user/ProfileSchema';

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
  user: UserProfileResponseSchema,
  commentsCount: z.number().optional(),
  updatedAt: z.date(),
  createdAt: z.date()
});

export const PostInsertSchema = z.object({
  title: z.string(),
  userId: z.string().uuid(),
  description: z.string().optional().nullable(),
  id: z.string().uuid().optional(),
  updatedAt: z.date().optional(),
  createdAt: z.date().optional()
});

export const PostUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  userId: z.string().uuid().optional()
});

export type PostInsert = z.infer<typeof PostInsertSchema>;
export type PostUpdate = z.infer<typeof PostUpdateSchema>;

export interface GetPostsResult {
  posts: Post[];
  total: number;
}

export type GetPostsRepoParams = {
  limit: number;
  offset: number;
  search?: string;
  sortBy: PostSortField;
  sortOrder?: SortOrder;
  commentsCountOperator?: CountOperator;
  commentsCountValue?: number;
};

export type GetPostsParams = {
  postRepo: IPostRepo;
} & GetPostsRepoParams;

export type GetPostByIdParams = {
  postRepo: IPostRepo;
  postId: string;
};

export type CreatePostParams = {
  postRepo: IPostRepo;
  data: PostInsert;
};

export type UpdatePostByIdParams = {
  postRepo: IPostRepo;
  postId: string;
  data: PostUpdate;
  userId: string;
};

export type DeletePostByIdParams = {
  postRepo: IPostRepo;
  postId: string;
  userId: string;
};

export type Post = z.infer<typeof PostSchema>;