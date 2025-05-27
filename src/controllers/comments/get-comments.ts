import { ICommentRepo } from 'src/types/comments/ICommentRepo';

export async function getComments(params: {
  commentRepo: ICommentRepo;
  postId: string;
}) {
  const comments = await params.commentRepo.getComments(params.postId);

  return comments;
}