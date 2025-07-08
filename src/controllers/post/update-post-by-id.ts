import { HttpError } from 'src/api/errors/HttpError';
import { UpdatePostByIdParams } from 'src/types/posts/Post';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export async function updatePostById(params: UpdatePostByIdParams) {
  // First check if the post exists
  const existingPost = await params.postRepo.getPostById(params.postId);

  if (!existingPost) {
    throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.POST_NOT_FOUND
    });
  }

  // Check if the user is the owner of the post or an admin
  const isPostOwner = existingPost.user.id === params.userId;
  const isAdmin = params.userRole === 'admin';
  
  if (!isPostOwner && !isAdmin) {
    throw new HttpError({
      statusCode: 403,
      errorCode: EErrorCodes.UNAUTHORIZED
    });
  }

  // Update the post
  const post = await params.postRepo.updatePostById(params.postId, params.data);

  if (!post) {
    throw new HttpError({
      statusCode: 500,
      errorCode: EErrorCodes.GENERAL_ERROR
    });
  }

  return post;
}