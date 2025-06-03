import { Comment, CreateCommentRepoParams, DeleteCommentByIdRepoParams, GetCommentsRepoParams } from './Comment';

export interface ICommentRepo {
  getComments(postId: GetCommentsRepoParams): Promise<Comment[]>;
  createComment(data: CreateCommentRepoParams): Promise<Comment>;
  updateCommentById(id: string, data: Partial<Comment>): Promise<Comment | null>;
  deleteCommentById(id: DeleteCommentByIdRepoParams): Promise<void>;
}