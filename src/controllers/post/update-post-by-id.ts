import { HttpError } from 'src/api/errors/HttpError';
import { IPostRepo } from 'src/types/posts/IPostRepo';
import { Post } from 'src/types/posts/Post';

export async function updatePostById(params: {
  postRepo: IPostRepo;
  postId: string;
  data: Partial<Post>;
}) {
  const post = await params.postRepo.updatePostById(params.postId, params.data);

  if (!post) {
    throw new HttpError(404, 'Post not found');
  }

  return post;
}