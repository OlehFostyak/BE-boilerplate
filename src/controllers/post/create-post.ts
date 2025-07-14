import { CreatePostParams } from 'src/types/posts/Post';

export async function createPost(params: CreatePostParams) {
  // Create the post first
  const post = await params.postRepo.createPost(params.data);

  // If tagIds are provided, add tags to the post
  if (params.tagIds && params.tagIds.length > 0 && params.tagRepo) {
    await params.tagRepo.addTagsToPost(post.id, params.tagIds);
  }

  return post;
}