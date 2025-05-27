import { ICommentRepo } from 'src/types/comments/ICommentRepo';

export async function deleteCommentById(params: {
  commentRepo: ICommentRepo;
  commentId: string;
}) {
  await params.commentRepo.deleteCommentById(params.commentId);
}