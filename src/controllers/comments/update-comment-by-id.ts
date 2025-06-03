import { HttpError } from 'src/api/errors/HttpError';
import { UpdateCommentByIdParams } from 'src/types/comments/Comment';

export async function updateCommentById(params: UpdateCommentByIdParams) {
  const comment = await params.commentRepo.updateCommentById(params.commentId, params.data);

  if (!comment) {
    throw new HttpError(404, 'Comment not found');
  }

  return comment;
}