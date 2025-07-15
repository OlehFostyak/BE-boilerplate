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
      
      const [{ total }] = await db
        .select({ total: count() })
        .from(archivedPostTable)
        .where(and(searchArchivedPosts(search), commentsCountCondition, tagsCondition));

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
          const tags = await db
            .select({
              ...getTableColumns(tagTable),
              postsCount: count(archivedPostTagTable.id)
            })
            .from(tagTable)
            .innerJoin(archivedPostTagTable, eq(archivedPostTagTable.tagId, tagTable.id))
            .where(eq(archivedPostTagTable.archivedPostId, post.id))
            .groupBy(tagTable.id);
            
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
      const post = await db
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
        
      if (post.length === 0) {
        return null;
      }
      
      // Get tags for the archived post
      const tags = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(archivedPostTagTable.id)
        })
        .from(tagTable)
        .innerJoin(archivedPostTagTable, eq(archivedPostTagTable.tagId, tagTable.id))
        .where(eq(archivedPostTagTable.archivedPostId, post[0].id))
        .groupBy(tagTable.id);
      
      const postWithTags = {
        ...post[0],
        tags
      };
        
      return ArchivedPostSchema.parse(postWithTags);
    },

    async archivePostById(id) {
      return await db.transaction(async (tx) => {
        // Get the post with user information
        const post = await tx
          .select({
            ...getTableColumns(postTable),
            user: getUserFields()
          })
          .from(postTable)
          .leftJoin(userTable, eq(userTable.id, postTable.userId))
          .where(eq(postTable.id, id));
        
        if (post.length === 0) {
          return null;
        }

        // Get comments for the post
        const comments = await tx
          .select({
            ...getTableColumns(commentTable),
            user: getUserFields()
          })
          .from(commentTable)
          .leftJoin(userTable, eq(userTable.id, commentTable.userId))
          .where(eq(commentTable.postId, id));
          
        // Get tags for the post
        const tags = await tx
          .select({
            ...getTableColumns(tagTable),
            postsCount: count(postTagTable.id)
          })
          .from(tagTable)
          .innerJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
          .where(eq(postTagTable.postId, id))
          .groupBy(tagTable.id);

        // Archive the post
        const [archivedPost] = await tx.insert(archivedPostTable).values({
          originalId: post[0].id,
          title: post[0].title,
          description: post[0].description,
          userId: post[0].userId,
          createdAt: post[0].createdAt,
          updatedAt: post[0].updatedAt
        }).returning();
        
        // Create archived post tags
        if (tags.length > 0) {
          const archivedPostTagValues = tags.map(tag => ({
            archivedPostId: archivedPost.id,
            tagId: tag.id
          }));
          
          await tx.insert(archivedPostTagTable).values(archivedPostTagValues);
        }

        // Archive comments
        if (comments.length > 0) {
          const archivedCommentValues = comments.map(comment => ({
            originalId: comment.id,
            text: comment.text,
            postId: archivedPost.id,
            userId: comment.userId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
          }));
          
          await tx.insert(archivedCommentTable).values(archivedCommentValues);
        }

        // 7. Delete the original post (cascades delete for comments and post-tag relationships)
        await tx.delete(postTable).where(eq(postTable.id, id));

        // 8. Return the archived post with user information
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
        
        if (archivedPost.length === 0) {
          return null;
        }

        // Get archived comments for the post
        const archivedComments = await tx
          .select({
            ...getTableColumns(archivedCommentTable)
          })
          .from(archivedCommentTable)
          .where(eq(archivedCommentTable.postId, id));
          
        // Get tags for the archived post
        const archivedPostTags = await tx
          .select({
            ...getTableColumns(tagTable),
            archivedPostId: archivedPostTagTable.archivedPostId
          })
          .from(tagTable)
          .innerJoin(archivedPostTagTable, eq(archivedPostTagTable.tagId, tagTable.id))
          .where(eq(archivedPostTagTable.archivedPostId, archivedPost[0].id));

        // Restore the post
        const [restoredPost] = await tx.insert(postTable).values({
          id: archivedPost[0].originalId, // Use the original ID
          title: archivedPost[0].title,
          description: archivedPost[0].description,
          userId: archivedPost[0].userId,
          createdAt: archivedPost[0].createdAt,
          updatedAt: new Date() // Update the updatedAt timestamp
        }).returning();

        // Restore comments
        if (archivedComments.length > 0) {
          await tx.insert(commentTable).values(
            archivedComments.map(comment => ({
              id: comment.originalId, // Use the original ID
              text: comment.text,
              postId: restoredPost.id,
              userId: comment.userId,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt
            }))
          );
        }
        
        // Restore tags
        if (archivedPostTags.length > 0) {
          await tx.insert(postTagTable).values(
            archivedPostTags.map(tag => ({
              postId: restoredPost.id,
              tagId: tag.id
            }))
          );
        }

        // Delete the archived post (cascades delete for archived comments and post-tag relationships)
        await tx.delete(archivedPostTable).where(eq(archivedPostTable.id, id));

        // Return the original post ID
        return restoredPost.id;
      });
    },

    async deleteArchivedPostById(id) {
      // Get archived post with user information before deleting
      const archivedPost = await db
        .select({
          ...getTableColumns(archivedPostTable),
          user: getUserFields()
        })
        .from(archivedPostTable)
        .leftJoin(userTable, eq(userTable.id, archivedPostTable.userId))
        .where(eq(archivedPostTable.id, id));
      
      if (archivedPost.length === 0) {
        return null;
      }
      
      // Get tags for the archived post
      const tags = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(archivedPostTagTable.id)
        })
        .from(tagTable)
        .innerJoin(archivedPostTagTable, eq(archivedPostTagTable.tagId, tagTable.id))
        .where(eq(archivedPostTagTable.archivedPostId, archivedPost[0].id))
        .groupBy(tagTable.id);
      
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
