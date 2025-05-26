import { ICommentRepo } from 'src/types/ICommentRepo';
import { Comment } from 'src/types/Comment';

export async function createComment(params: {
  commentRepo: ICommentRepo;
  data: Partial<Comment>;
}) {
  const comment = await params.commentRepo.createComment(params.data);

  return comment;
}