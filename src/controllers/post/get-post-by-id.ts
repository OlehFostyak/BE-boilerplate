import { HttpError } from 'src/api/errors/HttpError';
import { GetPostByIdParams } from 'src/types/posts/Post';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export async function getPostById(params: GetPostByIdParams) {
  const post = await params.postRepo.getPostById(params.postId);

  if (!post) {
    throw new HttpError({
      statusCode: 404,
      message: 'Post not found',
      errorCode: EErrorCodes.POST_NOT_FOUND
    });
  }

  return post;
}