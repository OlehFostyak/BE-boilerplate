import { GetPostsResult, Post } from './Post';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';
import { CountOperator } from 'src/services/drizzle/utils/filtering';

export interface IPostRepo {
  getPosts(params: {
    limit: number;
    offset: number;
    search?: string;
    sortBy: PostSortField;
    sortOrder?: SortOrder;
    commentsCountOperator?: CountOperator;
    commentsCountValue?: number;
  }): Promise<GetPostsResult>;
  getPostById(id: string): Promise<Post | null>;
  createPost(data: Partial<Post>): Promise<Post>;
  updatePostById(id: string, data: Partial<Post>): Promise<Post | null>;
  deletePostById(id: string): Promise<Post | null>;
}