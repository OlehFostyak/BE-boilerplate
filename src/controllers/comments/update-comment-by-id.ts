import { HttpError } from 'src/api/errors/HttpError';
import { ICommentRepo } from 'src/types/comments/ICommentRepo';
import { Comment } from 'src/types/comments/Comment';

export async function updateCommentById(params: {
  commentRepo: ICommentRepo;
  commentId: string;
  data: Partial<Comment>;
}) {
  const comment = await params.commentRepo.updateCommentById(params.commentId, params.data);

  if (!comment) {
    throw new HttpError(404, 'Comment not found');
  }

  return comment;
}