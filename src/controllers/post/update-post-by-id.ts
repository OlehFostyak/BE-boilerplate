import { HttpError } from 'src/api/errors/HttpError';
import { UpdatePostByIdParams } from 'src/types/posts/Post';

export async function updatePostById(params: UpdatePostByIdParams) {
  const post = await params.postRepo.updatePostById(params.postId, params.data);

  if (!post) {
    throw new HttpError(404, 'Post not found');
  }

  return post;
}