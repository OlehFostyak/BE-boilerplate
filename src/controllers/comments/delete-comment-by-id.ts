import { HttpError } from 'src/api/errors/HttpError';
import { DeleteCommentByIdParams } from 'src/types/comments/Comment';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export async function deleteCommentById(params: DeleteCommentByIdParams) {
  // First check if the comment exists
  const existingComment = await params.commentRepo.getCommentById(params.commentId);

  if (!existingComment) {
    throw new HttpError({
      statusCode: 404,
      message: 'Comment not found',
      errorCode: EErrorCodes.COMMENT_NOT_FOUND
    });
  }

  // Check if the user is the owner of the comment, the owner of the post, or an admin
  const isCommentOwner = existingComment.user.id === params.userId;
  const isPostOwner = params.postOwnerId && existingComment.postId === params.postOwnerId;
  const isAdmin = params.userRole === 'admin';

  if (!isCommentOwner && !isPostOwner && !isAdmin) {
    throw new HttpError({
      statusCode: 403,
      message: 'You do not have permission to delete this comment',
      errorCode: EErrorCodes.UNAUTHORIZED
    });
  }

  // Delete the comment
  const deletedComment = await params.commentRepo.deleteCommentById(params.commentId);

  if (!deletedComment) {
    throw new HttpError({
      statusCode: 500,
      message: 'Failed to delete comment',
      errorCode: EErrorCodes.GENERAL_ERROR
    });
  }
}