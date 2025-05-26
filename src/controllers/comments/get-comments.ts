import { ICommentRepo } from 'src/types/ICommentRepo';

export async function getComments(params: {
  commentRepo: ICommentRepo;
  postId: string;
}) {
  const comments = await params.commentRepo.getComments(params.postId);

  return comments;
}