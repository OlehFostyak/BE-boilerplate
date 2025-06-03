import { HttpError } from 'src/api/errors/HttpError';
import { DeletePostByIdParams } from 'src/types/posts/Post';

export async function deletePostById(params: DeletePostByIdParams) {
  const post = await params.postRepo.deletePostById(params.postId);

  if (!post) {
    throw new HttpError(404, 'Post not found');
  }
}