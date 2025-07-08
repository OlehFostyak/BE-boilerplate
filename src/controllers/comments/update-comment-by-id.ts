import { HttpError } from 'src/api/errors/HttpError';
import { UpdateCommentByIdParams } from 'src/types/comments/Comment';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export async function updateCommentById(params: UpdateCommentByIdParams) {
  // First check if the comment exists
  const existingComment = await params.commentRepo.getCommentById(params.commentId);

  if (!existingComment) {
    throw new HttpError({
      statusCode: 404,
      message: 'Comment not found',
      errorCode: EErrorCodes.COMMENT_NOT_FOUND
    });
  }

  // Check if the user is the owner of the comment or an admin
  const isCommentOwner = existingComment.user.id === params.userId;
  const isAdmin = params.userRole === 'admin';
  
  if (!isCommentOwner && !isAdmin) {
    throw new HttpError({
      statusCode: 403,
      message: 'Permission denied: only comment author or admin can update',
      errorCode: EErrorCodes.UNAUTHORIZED
    });
  }

  // Update the comment
  const comment = await params.commentRepo.updateCommentById(
    params.commentId,
    params.data
  );

  if (!comment) {
    throw new HttpError({
      statusCode: 500,
      message: 'Failed to update comment',
      errorCode: EErrorCodes.GENERAL_ERROR
    });
  }

  return comment;
}