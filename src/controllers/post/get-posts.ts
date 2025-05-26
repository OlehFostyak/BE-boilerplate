import { IPostRepo } from 'src/types/IPostRepo';

export async function getPosts(params: {
  postRepo: IPostRepo;
}) {
  const posts = await params.postRepo.getPosts();

  return posts;
}