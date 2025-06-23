import { HttpError } from 'src/api/errors/HttpError';
import { ForbiddenError } from 'src/types/errors/ForbiddenError';
import { UpdateCommentByIdParams } from 'src/types/comments/Comment';

export async function updateCommentById(params: UpdateCommentByIdParams) {
  // First check if the comment exists
  const existingComment = await params.commentRepo.getCommentById(params.commentId);

  if (!existingComment) {
    throw new HttpError(404, 'Comment not found');
  }

  // Check if the user is the owner of the comment
  if (existingComment.user.id !== params.userId) {
    throw new ForbiddenError('Permission denied: only comment author can update');
  }

  // Update the comment
  const comment = await params.commentRepo.updateCommentById(
    params.commentId,
    params.data
  );

  if (!comment) {
    throw new HttpError(500, 'Failed to update comment');
  }

  return comment;
}