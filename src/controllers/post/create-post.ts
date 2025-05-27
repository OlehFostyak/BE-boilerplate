import { IPostRepo } from 'src/types/posts/IPostRepo';
import { Post } from 'src/types/posts/Post';

export async function createPost(params: {
  postRepo: IPostRepo;
  data: Partial<Post>;
}) {
  const post = await params.postRepo.createPost(params.data);

  return post;
}