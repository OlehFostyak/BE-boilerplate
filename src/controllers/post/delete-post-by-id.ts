import { IPostRepo } from 'src/types/IPostRepo';

export async function deletePostById(params: {
  postRepo: IPostRepo;
  postId: string;
}) {
  await params.postRepo.deletePostById(params.postId);
}