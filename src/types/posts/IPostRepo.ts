import { Post } from './Post';

export interface IPostRepo {
  getPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | null>;
  createPost(data: Partial<Post>): Promise<Post>;
  updatePostById(id: string, data: Partial<Post>): Promise<Post | null>;
  deletePostById(id: string): Promise<Post | null>;
}