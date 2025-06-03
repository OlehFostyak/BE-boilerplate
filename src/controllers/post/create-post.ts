import { CreatePostParams } from 'src/types/posts/Post';

export async function createPost(params: CreatePostParams) {
  const post = await params.postRepo.createPost(params.data);

  return post;
}