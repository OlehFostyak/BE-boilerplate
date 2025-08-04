import { GetPostsRepoParams, GetPostsResult, Post, PostInsert, PostUpdate } from './Post';

export interface IPostRepo {
  getPosts(params: GetPostsRepoParams): Promise<GetPostsResult>;
  getPostById(id: string): Promise<Post | null>;
  createPost(data: PostInsert): Promise<Post>;
  updatePostById(id: string, data: PostUpdate): Promise<Post | null>;
  deletePostById(id: string): Promise<Post | null>;
  // Methods for archiving - get ALL user data without pagination
  getAllPostsByUserId(userId: string): Promise<Post[]>;
}