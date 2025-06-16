import { z } from 'zod';
import { ICommentRepo } from './ICommentRepo';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  updatedAt: z.date(),
  createdAt: z.date()
});

export const CommentInsertSchema = z.object({
  text: z.string(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  id: z.string().uuid().optional(),
  updatedAt: z.date().optional(),
  createdAt: z.date().optional()
});

export const CommentUpdateSchema = z.object({
  text: z.string().optional(),
  userId: z.string().uuid().optional()
});

export type CommentInsert = z.infer<typeof CommentInsertSchema>;
export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;

export type Comment = z.infer<typeof CommentSchema>;

export type GetCommentsRepoParams = string;

export type CreateCommentRepoParams = CommentInsert;

export type UpdateCommentByIdRepoParams = {
  id: string;
  data: CommentUpdate;
};

export type DeleteCommentByIdRepoParams = string;

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
  data: CommentUpdate;
};

export type DeleteCommentByIdParams = {
  commentRepo: ICommentRepo;
  commentId: DeleteCommentByIdRepoParams;
};