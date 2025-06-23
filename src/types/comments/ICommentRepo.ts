import { Comment, CommentInsert, CommentUpdate, GetCommentsRepoParams } from './Comment';

export interface ICommentRepo {
  getComments(postId: GetCommentsRepoParams): Promise<Comment[]>;
  createComment(data: CommentInsert): Promise<Comment>;
  getCommentById(id: string): Promise<Comment | null>;
  updateCommentById(id: string, data: CommentUpdate): Promise<Comment | null>;
  deleteCommentById(id: string): Promise<Comment | null>;
}