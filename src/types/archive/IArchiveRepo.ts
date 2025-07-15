import { ArchivedPost, GetArchivedPostsResult } from './ArchivedPost';
import { ArchivedComment } from './ArchivedComment';

import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';

export interface GetArchivedPostsParams {
  limit: number;
  offset: number;
  search?: string;
  sortBy?: PostSortField;
  sortOrder?: SortOrder;
  commentsCountOperator?: string;
  commentsCountValue?: number;
  tagIds?: string[];
}

export interface IArchiveRepo {
  // Posts
  getArchivedPosts(params: GetArchivedPostsParams): Promise<GetArchivedPostsResult>;
  getArchivedPostById(id: string): Promise<ArchivedPost | null>;
  archivePostById(postId: string): Promise<ArchivedPost | null>;
  restorePostById(archivedPostId: string): Promise<string | null>;
  deleteArchivedPostById(id: string): Promise<ArchivedPost | null>;
  
  // Comments
  getArchivedCommentsByPostId(archivedPostId: string): Promise<ArchivedComment[]>;
}
