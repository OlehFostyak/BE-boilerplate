import { IPostRepo } from 'src/types/IPostRepo';
import { Post } from 'src/types/Post';

export async function createPost(params: {
  postRepo: IPostRepo;
  data: Partial<Post>;
}) {
  const post = await params.postRepo.createPost(params.data);

  return post;
}