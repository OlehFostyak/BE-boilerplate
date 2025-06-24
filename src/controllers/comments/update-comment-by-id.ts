import { HttpError } from 'src/api/errors/HttpError';
import { UpdateCommentByIdParams } from 'src/types/comments/Comment';

export async function updateCommentById(params: UpdateCommentByIdParams) {
  // First check if the comment exists
  const existingComment = await params.commentRepo.getCommentById(params.commentId);

  if (!existingComment) {
    throw new HttpError(404, 'Comment not found');
  }

  // Check if the user is the owner of the comment or an admin
  const isCommentOwner = existingComment.user.id === params.userId;
  const isAdmin = params.userRole === 'admin';
  
  if (!isCommentOwner && !isAdmin) {
    throw new HttpError(403, 'Permission denied: only comment author or admin can update');
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