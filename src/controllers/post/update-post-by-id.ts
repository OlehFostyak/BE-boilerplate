import { HttpError } from 'src/api/errors/HttpError';
import { UpdatePostByIdParams } from 'src/types/posts/Post';

export async function updatePostById(params: UpdatePostByIdParams) {
  // First check if the post exists
  const existingPost = await params.postRepo.getPostById(params.postId);

  if (!existingPost) {
    throw new HttpError(404, 'Post not found');
  }

  // Check if the user is the owner of the post or an admin
  const isPostOwner = existingPost.user.id === params.userId;
  const isAdmin = params.userRole === 'admin';
  
  if (!isPostOwner && !isAdmin) {
    throw new HttpError(403, 'You do not have permission to update this post');
  }

  // Update the post
  const post = await params.postRepo.updatePostById(params.postId, params.data);

  if (!post) {
    throw new HttpError(500, 'Failed to update post');
  }

  return post;
}