import { z } from 'zod';
import { IPostRepo } from './IPostRepo';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';
import { CountOperator } from 'src/services/drizzle/utils/filtering';

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
  data: Partial<Post>;
};

export type UpdatePostByIdParams = {
  postRepo: IPostRepo;
  postId: string;
  data: Partial<Post>;
};

export type DeletePostByIdParams = {
  postRepo: IPostRepo;
  postId: string;
};

export type Post = z.infer<typeof PostSchema>;