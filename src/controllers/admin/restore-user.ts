import { ITransactionManager } from 'src/types/ITransaction';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';
import { adminEnableUser } from 'src/services/aws/cognito/modules/user';
import { getRepos } from 'src/repos';
import { IArchivedUserRepo } from 'src/types/archived-users/IArchivedUserRepo';
import { IUserRepo } from 'src/types/users/IUserRepo';
import { IPostRepo } from 'src/types/posts/IPostRepo';
import { ICommentRepo } from 'src/types/comments/ICommentRepo';
import { ITagRepo } from 'src/types/tags/ITagRepo';

export interface RestoreUserParams {
  archivedUserId: string;
  transactionManager: ITransactionManager;
}

// Validate and get archived user
async function validateAndGetArchivedUser(
  archivedUserId: string,
  archivedUserRepo: IArchivedUserRepo,
  userRepo: IUserRepo
) {
  // Get archived user data
  const archivedUsers = await archivedUserRepo.getArchivedUsers();
  const archivedUser = archivedUsers.find(au => au.id === archivedUserId);
  
  if (!archivedUser) {
    throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.ARCHIVED_USER_NOT_FOUND
    });
  }

  // Check if user already exists
  const existingUser = await userRepo.getUserById(archivedUser.originalUserId);
  if (existingUser) {
    throw new HttpError({
      statusCode: 409,
      errorCode: EErrorCodes.USER_ALREADY_EXISTS
    });
  }

  return archivedUser;
}

// Create restored user
async function createRestoredUser(userData: any, userRepo: IUserRepo) {
  return await userRepo.createUser({
    cognitoId: userData.cognitoId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName
  });
}

// Restore comments with proper user ID handling
async function restoreCommentsWithMapping(
  comments: any[],
  archivedUser: any,
  restoredUser: any,
  postRepo: IPostRepo,
  commentRepo: ICommentRepo,
  postIdMapping: Record<string, string> = {}
) {
  const commentsWithUpdatedUserId = comments.map(comment => ({
    ...comment,
    user: comment.user.id === archivedUser.originalUserId 
      ? { ...comment.user, id: restoredUser.id }
      : comment.user
  }));
  
  await restoreComments(commentsWithUpdatedUserId, postRepo, commentRepo, postIdMapping);
}

// Restore user's own comments with filtering
async function restoreUserCommentsFiltered(
  userComments: any[],
  restoredUser: any,
  postIdMapping: Record<string, string>,
  postRepo: IPostRepo,
  commentRepo: ICommentRepo
) {
  const userCommentsWithUpdatedId = userComments
    .filter(comment => !postIdMapping[comment.postId])
    .map(comment => ({
      ...comment,
      user: { ...comment.user, id: restoredUser.id }
    }));
    
  await restoreComments(userCommentsWithUpdatedId, postRepo, commentRepo, postIdMapping);
}

// Enable user in Cognito
async function enableUserInCognito(email: string) {
  try {
    await adminEnableUser({ email });
  } catch (cognitoError) {
    console.error('Warning: Failed to enable user in Cognito:', cognitoError);
  }
}

// Restore posts and their tags
async function restorePosts(
  posts: any[], 
  restoredUserId: string, 
  postRepo: IPostRepo,
  tagRepo: ITagRepo
) {
  const postIdMapping: Record<string, string> = {};
  
  if (!posts || posts.length === 0) {
    return postIdMapping;
  }

  for (const post of posts) {
    const restoredPost = await postRepo.createPost({
      title: post.title,
      description: post.description,
      userId: restoredUserId
    });

    // Create mapping from old post ID to new post ID
    postIdMapping[post.id] = restoredPost.id;

    // Restore post tags
    await restorePostTags(post.tags, restoredPost.id, tagRepo);
  }
  
  return postIdMapping;
}

// Restore post tags
async function restorePostTags(tags: any[], postId: string, tagRepo: ITagRepo) {
  if (!tags || tags.length === 0) {
    return;
  }

  const tagIds = [];
  for (const tag of tags) {
    // Check if tag exists, create if not
    let existingTag = await tagRepo.getTagByName(tag.name);
    if (!existingTag) {
      existingTag = await tagRepo.createTag({
        name: tag.name,
        description: tag.description
      });
    }
    tagIds.push(existingTag.id);
  }
  
  // Associate tags with post
  if (tagIds.length > 0) {
    await tagRepo.addTagsToPost(postId, tagIds);
  }
}

// Restore comments
async function restoreComments(
  comments: any[], 
  postRepo: IPostRepo,
  commentRepo: ICommentRepo,
  postIdMapping: Record<string, string> = {}
) {
  if (!comments || comments.length === 0) {
    return;
  }

  for (const comment of comments) {
    // Use new post ID if available, otherwise use original
    const postId = postIdMapping[comment.postId] || comment.postId;
    
    // Only restore comments if the post exists
    const post = await postRepo.getPostById(postId);
    if (post) {
      await commentRepo.createComment({
        text: comment.text,
        postId,
        userId: comment.userId || comment.user?.id
      });
    } else {
      console.warn(`Post not found for comment: ${comment.id}, postId: ${postId}`);
    }
  }
}

export async function restoreUser(
  params: RestoreUserParams
): Promise<{ success: true; restoredUserId: string }> {
  const { 
    archivedUserId, 
    transactionManager 
  } = params;

  try {
    return await transactionManager.execute(async (ctx) => {
      const { sharedTx } = ctx;
      
      const {
        archivedUserRepo,
        userRepo,
        postRepo,
        commentRepo,
        tagRepo
      } = getRepos(sharedTx as any);
      
      // Validate and get archived user
      const archivedUser = await validateAndGetArchivedUser(
        archivedUserId,
        archivedUserRepo,
        userRepo
      );

      // Parse archived data
      const restoredData = await archivedUserRepo.restoreUserData(archivedUser);
      
      // Create restored user
      const restoredUser = await createRestoredUser(restoredData.user, userRepo);

      // Restore posts and get ID mapping
      const postIdMapping = restoredData.posts ? 
        await restorePosts(restoredData.posts, restoredUser.id, postRepo, tagRepo) : {};

      // Restore comments on user's posts
      if (restoredData.commentsOnPosts) {
        await restoreCommentsWithMapping(
          restoredData.commentsOnPosts,
          archivedUser,
          restoredUser,
          postRepo,
          commentRepo,
          postIdMapping
        );
      }

      // Restore user's comments on other posts (filtered)
      if (restoredData.userComments) {
        await restoreUserCommentsFiltered(
          restoredData.userComments,
          restoredUser,
          postIdMapping,
          postRepo,
          commentRepo
        );
      }

      // Remove from archived users
      await archivedUserRepo.deleteArchivedUser(archivedUserId);

      // Enable user in Cognito (non-blocking)
      await enableUserInCognito(restoredUser.email);

      return {
        success: true,
        restoredUserId: restoredUser.id
      };
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error('Error restoring user:', error);
    throw new HttpError({
      statusCode: 500,
      cause: error,
      errorCode: EErrorCodes.USER_RESTORE_FAILED
    });
  }
}