import { IPostRepo } from 'src/types/IPostRepo';

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