import { IPostRepo } from 'src/types/IPostRepo';

export async function deletePostById(params: {
  postRepo: IPostRepo;
  postId: string;
}) {
  const post = await params.postRepo.getPostById(params.postId);

  if (!post) {
    throw new Error('Post not found');
  }

  await params.postRepo.deletePostById(params.postId);
}