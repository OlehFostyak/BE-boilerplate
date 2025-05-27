import { IPostRepo } from 'src/types/posts/IPostRepo';

export async function getPostById(params: {
  postRepo: IPostRepo;
  postId: string;
}) {
  const post = await params.postRepo.getPostById(params.postId);
  if (!post) {
    throw new Error('Post not found');
  }

  return post;
}