import { HttpError } from 'src/api/errors/HttpError';
import { ForbiddenError } from 'src/types/errors/ForbiddenError';
import { DeleteCommentByIdParams } from 'src/types/comments/Comment';

export async function deleteCommentById(params: DeleteCommentByIdParams) {
  // First check if the comment exists
  const existingComment = await params.commentRepo.getCommentById(params.commentId);

  if (!existingComment) {
    throw new HttpError(404, 'Comment not found');
  }

  // Check if the user is the owner of the comment or the owner of the post
  const isCommentOwner = existingComment.user.id === params.userId;
  const isPostOwner = params.postOwnerId && existingComment.postId === params.postOwnerId;

  if (!isCommentOwner && !isPostOwner) {
    throw new ForbiddenError('You do not have permission to delete this comment');
  }

  // Delete the comment
  const deletedComment = await params.commentRepo.deleteCommentById(params.commentId);

  if (!deletedComment) {
    throw new HttpError(500, 'Failed to delete comment');
  }
}