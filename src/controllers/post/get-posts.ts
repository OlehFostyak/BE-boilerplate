import { GetPostsParams } from 'src/types/posts/Post';

export async function getPosts(params: GetPostsParams) {
  return params.postRepo.getPosts({
    limit: params.limit,
    offset: params.offset,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    commentsCountOperator: params.commentsCountOperator,
    commentsCountValue: params.commentsCountValue,
    tagIds: params.tagIds
  });
}