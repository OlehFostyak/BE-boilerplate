import { Comment, CommentInsert, CommentUpdate, DeleteCommentByIdRepoParams, GetCommentsRepoParams } from './Comment';

export interface ICommentRepo {
  getComments(postId: GetCommentsRepoParams): Promise<Comment[]>;
  createComment(data: CommentInsert): Promise<Comment>;
  updateCommentById(id: string, data: CommentUpdate): Promise<Comment | null>;
  deleteCommentById(id: DeleteCommentByIdRepoParams): Promise<void>;
}