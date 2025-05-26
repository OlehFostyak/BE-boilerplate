import { ICommentRepo } from 'src/types/ICommentRepo';

export async function deleteCommentById(params: {
  commentRepo: ICommentRepo;
  commentId: string;
}) {
  await params.commentRepo.deleteCommentById(params.commentId);
}