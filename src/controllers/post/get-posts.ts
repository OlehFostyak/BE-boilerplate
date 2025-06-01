import { IPostRepo } from 'src/types/posts/IPostRepo';

export async function getPosts(params: {
  postRepo: IPostRepo;
  limit: number;
  offset: number;
  search?: string;
}) {
  return params.postRepo.getPosts({
    limit: params.limit,
    offset: params.offset,
    search: params.search
  });
}