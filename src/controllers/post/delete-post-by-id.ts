import { HttpError } from 'src/api/errors/HttpError';
import { DeletePostByIdParams } from 'src/types/posts/Post';

export async function deletePostById(params: DeletePostByIdParams) {
  // First check if the post exists
  const existingPost = await params.postRepo.getPostById(params.postId);

  if (!existingPost) {
    throw new HttpError(404, 'Post not found');
  }

  // Check if the user is the owner of the post or an admin
  const isPostOwner = existingPost.user.id === params.userId;
  const isAdmin = params.userRole === 'admin';
  
  if (!isPostOwner && !isAdmin) {
    throw new HttpError(403, 'You do not have permission to delete this post');
  }

  // Delete the post
  const post = await params.postRepo.deletePostById(params.postId);

  if (!post) {
    throw new HttpError(500, 'Failed to delete post');
  }
}