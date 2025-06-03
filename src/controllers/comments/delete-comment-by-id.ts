import { DeleteCommentByIdParams } from 'src/types/comments/Comment';

export async function deleteCommentById(params: DeleteCommentByIdParams) {
  await params.commentRepo.deleteCommentById(params.commentId);
}