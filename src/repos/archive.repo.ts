import { eq, count, getTableColumns, or, sql, and, inArray, exists } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IArchiveRepo } from 'src/types/archive/IArchiveRepo';
import { ArchivedPostSchema } from 'src/types/archive/ArchivedPost';
import { ArchivedCommentSchema } from 'src/types/archive/ArchivedComment';
import { 
  userTable, 
  postTable, 
  commentTable, 
  tagTable, 
  postTagTable, 
  archivedPostTable, 
  archivedCommentTable, 
  archivedPostTagTable 
} from 'src/services/drizzle/schema';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { createSortBuilder } from 'src/services/drizzle/utils/sorting';
import { CountOperator, createCountFilter } from 'src/services/drizzle/utils/filtering';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';
import { getUserFields } from 'src/services/drizzle/utils/user-fields';

// Utility functions
function searchArchivedPosts(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return or(
    sql`similarity(${archivedPostTable.title}::text, ${search}::text) > 0.3`,
    sql`similarity(${archivedPostTable.description}::text, ${search}::text) > 0.3`
  );
}

function getCommentsCountCondition(
  operator: CountOperator | undefined,
  value: number = 0,
  db: NodePgDatabase
) {
  if (!operator) {
    return undefined;
  }

  return createCountFilter(
    operator,
    value,
    db
    .select({ count: count() })
    .from(archivedCommentTable)
    .where(eq(archivedCommentTable.postId, archivedPostTable.id))
  );
}

function getTagsCondition(tagIds: string[] | undefined, db: NodePgDatabase) {
  if (!tagIds || tagIds.length === 0) {
    return undefined;
  }

  // Using Drizzle's exists operator with a subquery
  const subquery = db
    .select({ value: sql`1` })
    .from(archivedPostTagTable)
    .where(
      and(
        eq(archivedPostTagTable.archivedPostId, archivedPostTable.id),
        inArray(archivedPostTagTable.tagId, tagIds)
      )
    );

  return exists(subquery);
}

function sortArchivedPosts(sortBy: PostSortField = 'createdAt', sortOrder?: SortOrder) {
  const sortFunction = createSortBuilder<PostSortField>({
    title: (direction) => direction(archivedPostTable.title),
    createdAt: (direction) => direction(archivedPostTable.archivedAt),
    commentsCount: (direction) => direction(count(archivedCommentTable.id))
  });

  return sortFunction(sortBy, sortOrder);
}

// Helper functions for archive operations

// Get post with user information by ID
async function getPostWithUserById(db: NodePgDatabase, id: string) {
  return db
    .select({
      ...getTableColumns(postTable),
      user: getUserFields()
    })
    .from(postTable)
    .leftJoin(userTable, eq(userTable.id, postTable.userId))
    .where(eq(postTable.id, id));
}

// Get archived post with user information by ID
async function getArchivedPostWithUserById(db: NodePgDatabase, id: string) {
  return db
    .select({
      ...getTableColumns(archivedPostTable),
      commentsCount: count(archivedCommentTable.id),
      user: getUserFields()
    })
    .from(archivedPostTable)
    .leftJoin(archivedCommentTable, eq(archivedCommentTable.postId, archivedPostTable.id))
    .leftJoin(userTable, eq(userTable.id, archivedPostTable.userId))
    .where(eq(archivedPostTable.id, id))
    .groupBy(archivedPostTable.id, userTable.id);
}

// Get comments for a post
async function getCommentsForPost(db: NodePgDatabase, postId: string) {
  return db
    .select({
      ...getTableColumns(commentTable),
      user: getUserFields()
    })
    .from(commentTable)
    .leftJoin(userTable, eq(userTable.id, commentTable.userId))
    .where(eq(commentTable.postId, postId));
}

// Get archived comments for a post
async function getArchivedCommentsForPost(db: NodePgDatabase, postId: string) {
  return db
    .select({
      ...getTableColumns(archivedCommentTable)
    })
    .from(archivedCommentTable)
    .where(eq(archivedCommentTable.postId, postId));
}

// Get tags for a post
async function getTagsForPost(db: NodePgDatabase, postId: string) {
  return db
    .select({
      ...getTableColumns(tagTable),
      postsCount: count(postTagTable.id)
    })
    .from(tagTable)
    .innerJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
    .where(eq(postTagTable.postId, postId))
    .groupBy(tagTable.id);
}

// Get tags for an archived post
async function getTagsForArchivedPost(db: NodePgDatabase, postId: string) {
  return db
    .select({
      ...getTableColumns(tagTable),
      postsCount: count(archivedPostTagTable.id)
    })
    .from(tagTable)
    .innerJoin(archivedPostTagTable, eq(archivedPostTagTable.tagId, tagTable.id))
    .where(eq(archivedPostTagTable.archivedPostId, postId))
    .groupBy(tagTable.id);
}

// Get archived post tags with post ID
async function getArchivedPostTagsWithPostId(db: NodePgDatabase, postId: string) {
  return db
    .select({
      ...getTableColumns(tagTable),
      archivedPostId: archivedPostTagTable.archivedPostId
    })
    .from(tagTable)
    .innerJoin(archivedPostTagTable, eq(archivedPostTagTable.tagId, tagTable.id))
    .where(eq(archivedPostTagTable.archivedPostId, postId));
}

// Create archived post from original post
async function createArchivedPost(tx: NodePgDatabase, post: any) {
  return await tx.insert(archivedPostTable).values({
    originalId: post.id,
    title: post.title,
    description: post.description,
    userId: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }).returning();
}

// Archive post tags
async function archivePostTags(tx: NodePgDatabase, archivedPostId: string, tags: any[]) {
  if (tags.length === 0) {return;}
  
  const archivedPostTagValues = tags.map(tag => ({
    archivedPostId,
    tagId: tag.id
  }));
  
  await tx.insert(archivedPostTagTable).values(archivedPostTagValues);
}

// Archive post comments
async function archivePostComments(tx: NodePgDatabase, archivedPostId: string, comments: any[]) {
  if (comments.length === 0) {return;}
  
  const archivedCommentValues = comments.map(comment => ({
    originalId: comment.id,
    text: comment.text,
    postId: archivedPostId,
    userId: comment.userId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  }));
  
  await tx.insert(archivedCommentTable).values(archivedCommentValues);
}

// Restore post from archived post
async function restorePost(tx: NodePgDatabase, archivedPost: any) {
  return await tx.insert(postTable).values({
    id: archivedPost.originalId, // Use the original ID
    title: archivedPost.title,
    description: archivedPost.description,
    userId: archivedPost.userId,
    createdAt: archivedPost.createdAt,
    updatedAt: new Date() // Update the updatedAt timestamp
  }).returning();
}

// Restore comments from archived comments
async function restoreComments(tx: NodePgDatabase, archivedComments: any[], postId: string) {
  if (archivedComments.length === 0) {return;}
  
  await tx.insert(commentTable).values(
    archivedComments.map(comment => ({
      id: comment.originalId, // Use the original ID
      text: comment.text,
      postId,
      userId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }))
  );
}

// Restore post tags
async function restorePostTags(tx: NodePgDatabase, postId: string, archivedPostTags: any[]) {
  if (archivedPostTags.length === 0) {return;}
  
  await tx.insert(postTagTable).values(
    archivedPostTags.map(tag => ({
      postId,
      tagId: tag.id
    }))
  );
}

export function getArchiveRepo(db: NodePgDatabase): IArchiveRepo {
  return {
    async getArchivedPosts({
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
      commentsCountOperator,
      commentsCountValue,
      tagIds
    }) {
      // Create filter conditions
      const commentsCountCondition = getCommentsCountCondition(
        commentsCountOperator as CountOperator | undefined,
        commentsCountValue,
        db
      );
      
      const tagsCondition = getTagsCondition(tagIds, db);
      
      // Get total count of posts matching the filters
      const [{ total }] = await db
        .select({ total: count() })
        .from(archivedPostTable)
        .where(and(searchArchivedPosts(search), commentsCountCondition, tagsCondition));

      // Get posts with pagination and sorting
      const archivedPosts = await db
        .select({
          ...getTableColumns(archivedPostTable),
          commentsCount: count(archivedCommentTable.id),
          user: getUserFields()
        })
        .from(archivedPostTable)
        .leftJoin(archivedCommentTable, eq(archivedCommentTable.postId, archivedPostTable.id))
        .leftJoin(userTable, eq(userTable.id, archivedPostTable.userId))
        .where(and(searchArchivedPosts(search), commentsCountCondition, tagsCondition))
        .groupBy(archivedPostTable.id, userTable.id)
        .orderBy(sortArchivedPosts(sortBy, sortOrder))
        .limit(limit)
        .offset(offset);
      
      // Get tags for each archived post
      const postsWithTags = await Promise.all(
        archivedPosts.map(async (post) => {
          const tags = await getTagsForArchivedPost(db, post.id);
          return {
            ...post,
            tags
          };
        })
      );

      return {
        posts: postsWithTags.map(post => ArchivedPostSchema.parse(post)),
        total
      };
    },

    async getArchivedPostById(id) {
      const post = await getArchivedPostWithUserById(db, id);
        
      if (!post.length) {return null;}
      
      // Get tags for the archived post
      const tags = await getTagsForArchivedPost(db, post[0].id);
      
      const postWithTags = {
        ...post[0],
        tags
      };
        
      return ArchivedPostSchema.parse(postWithTags);
    },

    async archivePostById(id) {
      return await db.transaction(async (tx) => {
        // Get the post with user information
        const post = await getPostWithUserById(tx, id);
        
        if (!post.length) {
          return null;
        }

        // Get comments for the post
        const comments = await getCommentsForPost(tx, id);
          
        // Get tags for the post
        const tags = await getTagsForPost(tx, id);

        // Archive the post
        const [archivedPost] = await createArchivedPost(tx, post[0]);
        
        // Create archived post tags
        await archivePostTags(tx, archivedPost.id, tags);

        // Archive comments
        await archivePostComments(tx, archivedPost.id, comments);

        // Delete the original post (cascades delete for comments and post-tag relationships)
        await tx.delete(postTable).where(eq(postTable.id, id));

        // Return the archived post with user information
        const result = {
          ...archivedPost,
          user: post[0].user,
          commentsCount: comments.length,
          tags
        };
        
        // Parse through the schema to ensure correct type
        return ArchivedPostSchema.parse(result);
      });
    },

    async restorePostById(id) {
      return await db.transaction(async (tx) => {
        // Get the archived post
        const archivedPost = await tx
          .select({
            ...getTableColumns(archivedPostTable)
          })
          .from(archivedPostTable)
          .where(eq(archivedPostTable.id, id));
        
        if (!archivedPost.length) {
          return null;
        }

        // Get archived comments for the post
        const archivedComments = await getArchivedCommentsForPost(tx, id);
          
        // Get tags for the archived post
        const archivedPostTags = await getArchivedPostTagsWithPostId(tx, archivedPost[0].id);

        // Restore the post
        const [restoredPost] = await restorePost(tx, archivedPost[0]);

        // Restore comments
        await restoreComments(tx, archivedComments, restoredPost.id);
        
        // Restore tags
        await restorePostTags(tx, restoredPost.id, archivedPostTags);

        // Delete the archived post
        await tx.delete(archivedPostTable).where(eq(archivedPostTable.id, id));

        // Return the original post ID
        return restoredPost.id;
      });
    },

    async deleteArchivedPostById(id) {
      // Get archived post with user information before deleting
      const archivedPost = await getArchivedPostWithUserById(db, id);
      
      if (!archivedPost.length) {
        return null;
      }
      
      // Get tags for the archived post
      const tags = await getTagsForArchivedPost(db, archivedPost[0].id);
      
      await db.delete(archivedPostTable).where(eq(archivedPostTable.id, id));
      
      const postWithTags = {
        ...archivedPost[0],
        tags
      };
      
      return ArchivedPostSchema.parse(postWithTags);
    },

    async getArchivedCommentsByPostId(id) {
      const comments = await db
        .select({
          ...getTableColumns(archivedCommentTable),
          user: getUserFields()
        })
        .from(archivedCommentTable)
        .leftJoin(userTable, eq(userTable.id, archivedCommentTable.userId))
        .where(eq(archivedCommentTable.postId, id))
        .orderBy(archivedCommentTable.createdAt);
      
      return comments.map(comment => ArchivedCommentSchema.parse(comment));
    }
  };
}
