import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';
import { ArchivePostByIdParams } from 'src/types/posts/Post';

export async function archivePostById(params: ArchivePostByIdParams) {
  // First check if the post exists
  const existingPost = await params.postRepo.getPostById(params.postId);

  if (!existingPost) {
    throw new HttpError({
      statusCode: 404,
      message: 'Post not found',
      errorCode: EErrorCodes.POST_NOT_FOUND
    });
  }

  // Check if the user is the owner of the post or an admin
  const isPostOwner = existingPost.user.id === params.userId;
  const isAdmin = params.userRole === 'admin';
  
  if (!isPostOwner && !isAdmin) {
    throw new HttpError({
      statusCode: 403,
      message: 'You do not have permission to delete this post',
      errorCode: EErrorCodes.UNAUTHORIZED
    });
  }

  // Archive the post
  const archivedPost = await params.archiveRepo.archivePostById(params.postId);

  if (!archivedPost) {
    throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.POST_NOT_FOUND
    });
  }

  return archivedPost;
}