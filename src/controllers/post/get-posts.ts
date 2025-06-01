import { IPostRepo } from 'src/types/posts/IPostRepo';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';

export async function getPosts(params: {
  postRepo: IPostRepo;
  limit: number;
  offset: number;
  search?: string;
  sortBy: PostSortField;
  sortOrder?: SortOrder;
}) {
  return params.postRepo.getPosts({
    limit: params.limit,
    offset: params.offset,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  });
}