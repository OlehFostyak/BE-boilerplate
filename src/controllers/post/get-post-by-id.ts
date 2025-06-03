import { HttpError } from 'src/api/errors/HttpError';
import { GetPostByIdParams } from 'src/types/posts/Post';

export async function getPostById(params: GetPostByIdParams) {
  const post = await params.postRepo.getPostById(params.postId);

  if (!post) {
    throw new HttpError(404, 'Post not found');
  }

  return post;
}