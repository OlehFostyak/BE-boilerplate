import { Comment } from './Comment';

export interface ICommentRepo {
  getComments(postId: string): Promise<Comment[]>;
  createComment(data: Partial<Comment>): Promise<Comment>;
  updateCommentById(id: string, data: Partial<Comment>): Promise<Comment | null>;
  deleteCommentById(id: string): Promise<void>;
}