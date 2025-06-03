import { CreateCommentParams } from 'src/types/comments/Comment';

export async function createComment(params: CreateCommentParams) {
  const comment = await params.commentRepo.createComment(params.data);

  return comment;
}