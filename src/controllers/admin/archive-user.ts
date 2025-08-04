import { IArchivedUserRepo } from 'src/types/archived-users/IArchivedUserRepo';
import { IUserRepo } from 'src/types/users/IUserRepo';
import { IPostRepo } from 'src/types/posts/IPostRepo';
import { ICommentRepo } from 'src/types/comments/ICommentRepo';
import { ITransactionManager } from 'src/types/ITransaction';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';
import { HttpError } from 'src/api/errors/HttpError';
import { adminDisableUser } from 'src/services/aws/cognito/modules/user';
import { getRepos } from 'src/repos';

export interface ArchiveUserParams {
  userId: string;
  archivedBy: string;
  transactionManager: ITransactionManager;
}

// Helper function to validate user can be archived
async function validateUserForArchiving(
  userId: string,
  archivedUserRepo: IArchivedUserRepo,
  userRepo: IUserRepo
) {
  // Check if user is already archived
  const existingArchive = await archivedUserRepo.getArchivedUserByOriginalId(userId);
  if (existingArchive) {
    throw new HttpError({
      statusCode: 409,
      errorCode: EErrorCodes.USER_ALREADY_ARCHIVED
    });
  }

  // Get user data
  const user = await userRepo.getUserById(userId);
  if (!user) {
    throw new HttpError({
      statusCode: 404,
      errorCode: EErrorCodes.USER_NOT_FOUND
    });
  }

  return user;
}

// Helper function to collect user's posts
async function getUserPosts(userId: string, postRepo: IPostRepo) {
  const userPostsResult = await postRepo.getPosts({
    limit: 10000,
    offset: 0,
    search: undefined,
    sortBy: 'createdAt',
    sortOrder: 'asc',
    commentsCountOperator: undefined,
    commentsCountValue: undefined,
    tagIds: undefined
  });

  return userPostsResult.posts.filter(post => post.user.id === userId);
}

// Helper function to collect comments on user's posts
async function getCommentsOnUserPosts(userPosts: any[], commentRepo: ICommentRepo) {
  const commentsOnPosts = [];
  
  for (const post of userPosts) {
    const comments = await commentRepo.getComments(post.id);
    commentsOnPosts.push(...comments);
  }
  
  return commentsOnPosts;
}

// Helper function to collect user's comments on all posts
async function getUserComments(userId: string, postRepo: IPostRepo, commentRepo: ICommentRepo) {
  const allPostsResult = await postRepo.getPosts({
    limit: 10000,
    offset: 0,
    search: undefined,
    sortBy: 'createdAt',
    sortOrder: 'asc',
    commentsCountOperator: undefined,
    commentsCountValue: undefined,
    tagIds: undefined
  });

  const userComments = [];
  
  for (const post of allPostsResult.posts) {
    const comments = await commentRepo.getComments(post.id);
    const userCommentsOnThisPost = comments.filter(comment => comment.user.id === userId);
    userComments.push(...userCommentsOnThisPost);
  }
  
  return userComments;
}

// Helper function to disable user in Cognito
async function disableUserInCognito(email: string) {
  try {
    await adminDisableUser({ email });
  } catch (cognitoError) {
    console.error('Warning: Failed to disable user in Cognito:', cognitoError);
    // Don't throw error - Cognito failure shouldn't break the transaction
  }
}

export async function archiveUser(
  params: ArchiveUserParams
): Promise<{ success: true; archivedId: string }> {
  const { 
    userId, 
    archivedBy, 
    transactionManager 
  } = params;

  try {
    return await transactionManager.execute(async (ctx) => {
      const { sharedTx } = ctx;
      
      // Create transaction-aware repositories
      const { archivedUserRepo, userRepo, postRepo, commentRepo } = getRepos(sharedTx as any);
      
      // Validate user can be archived
      const user = await validateUserForArchiving(userId, archivedUserRepo, userRepo);

      // Collect user's data
      const userPosts = await getUserPosts(userId, postRepo);
      const commentsOnPosts = await getCommentsOnUserPosts(userPosts, commentRepo);
      const userComments = await getUserComments(userId, postRepo, commentRepo);

      const archivedData = {
        originalUserId: user.id,
        userData: user,
        postsData: userPosts,
        commentsOnPostsData: commentsOnPosts,
        userCommentsData: userComments,
        archivedBy
      };

      // Create archived user record (within transaction)
      const archivedUser = await archivedUserRepo.createArchivedUser(archivedData);

      // Delete user from database (CASCADE handles related data)
      await userRepo.deleteUser(userId);

      // Disable user in Cognito (non-blocking)
      await disableUserInCognito(user.email);

      return {
        success: true,
        archivedId: archivedUser.id
      };
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error('Error archiving user:', error);
    throw new HttpError({
      statusCode: 500,
      cause: error,
      errorCode: EErrorCodes.USER_ARCHIVE_FAILED
    });
  }
}