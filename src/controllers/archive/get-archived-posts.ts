import { IArchiveRepo } from 'src/types/archive/IArchiveRepo';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';

interface GetArchivedPostsParams {
  archiveRepo: IArchiveRepo;
  limit: number;
  offset: number;
  search?: string;
  sortBy?: PostSortField;
  sortOrder?: SortOrder;
  commentsCountOperator?: string;
  commentsCountValue?: number;
  tagIds?: string[];
}

export async function getArchivedPosts({
  archiveRepo,
  limit,
  offset,
  search,
  sortBy,
  sortOrder,
  commentsCountOperator,
  commentsCountValue,
  tagIds
}: GetArchivedPostsParams) {
  return await archiveRepo.getArchivedPosts({
    limit,
    offset,
    search,
    sortBy,
    sortOrder,
    commentsCountOperator,
    commentsCountValue,
    tagIds
  });
}
