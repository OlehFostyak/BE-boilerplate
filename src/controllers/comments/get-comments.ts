import { GetCommentsParams } from 'src/types/comments/Comment';

export async function getComments(params: GetCommentsParams) {
  const comments = await params.commentRepo.getComments(params.postId);

  return comments;
}