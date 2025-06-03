import { z } from 'zod';
import { ICommentRepo } from './ICommentRepo';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  postId: z.string().uuid(),
  updatedAt: z.date(),
  createdAt: z.date()
});

export type Comment = z.infer<typeof CommentSchema>;

export type GetCommentsRepoParams = string; // postId

export type CreateCommentRepoParams = Partial<Comment>; // data

export type UpdateCommentByIdRepoParams = {
  id: string;
  data: Partial<Comment>;
};

export type DeleteCommentByIdRepoParams = string; // id

export type GetCommentsParams = {
  commentRepo: ICommentRepo;
  postId: GetCommentsRepoParams;
};

export type CreateCommentParams = {
  commentRepo: ICommentRepo;
  data: CreateCommentRepoParams;
};

export type UpdateCommentByIdParams = {
  commentRepo: ICommentRepo;
  commentId: string;
  data: Partial<Comment>;
};

export type DeleteCommentByIdParams = {
  commentRepo: ICommentRepo;
  commentId: DeleteCommentByIdRepoParams;
};