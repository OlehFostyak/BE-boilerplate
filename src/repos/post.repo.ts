import { eq, count, getTableColumns, or, sql, and, isNull } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IPostRepo } from 'src/types/posts/IPostRepo';
import { GetPostsResult, PostSchema } from 'src/types/posts/Post';
import { postTable, commentTable, userTable, postTagTable, tagTable } from 'src/services/drizzle/schema';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { createSortBuilder } from 'src/services/drizzle/utils/sorting';
import { CountOperator, createCountFilter } from 'src/services/drizzle/utils/filtering';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';
import { getUserFields } from 'src/services/drizzle/utils/user-fields';

function searchPosts(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return or(
    sql`similarity(${postTable.title}::text, ${search}::text) > 0.3`,
    sql`similarity(${postTable.description}::text, ${search}::text) > 0.3`
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
    .from(commentTable)
    .where(eq(commentTable.postId, postTable.id))
  );
}

function getTagsCondition(tagIds: string[] | undefined) {
  if (!tagIds || tagIds.length === 0) {
    return undefined;
  }

  return sql`EXISTS (
    SELECT 1 FROM ${postTagTable}
    WHERE ${postTagTable.postId} = ${postTable.id}
    AND ${postTagTable.tagId} IN ${tagIds}
  )`;
}

function sortPosts(sortBy: PostSortField, sortOrder?: SortOrder) {
  const sortFunction = createSortBuilder<PostSortField>({
    title: (direction) => direction(postTable.title),
    createdAt: (direction) => direction(postTable.createdAt),
    commentsCount: (direction) => direction(count(commentTable.id))
  });

  return sortFunction(sortBy, sortOrder);
}

export function getPostRepo(db: NodePgDatabase): IPostRepo {
  return {
    async getPosts({
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
      commentsCountOperator,
      commentsCountValue,
      tagIds
    }): Promise<GetPostsResult> {
      // Create filter conditions
      const commentsCountCondition = getCommentsCountCondition(
        commentsCountOperator,
        commentsCountValue,
        db
      );
      
      const tagsCondition = getTagsCondition(tagIds);

      const [{ total }] = await db
        .select({ total: count() })
        .from(postTable)
        .where(and(
          searchPosts(search),
          commentsCountCondition,
          tagsCondition,
          isNull(postTable.deletedAt)
        ));

      const posts = await db
        .select({
          ...getTableColumns(postTable),
          commentsCount: count(commentTable.id),
          user: getUserFields()
        })
        .from(postTable)
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .leftJoin(userTable, eq(userTable.id, postTable.userId))
        .where(and(
          searchPosts(search),
          commentsCountCondition,
          tagsCondition,
          isNull(postTable.deletedAt)
        ))
        .groupBy(postTable.id, userTable.id)
        .orderBy(sortPosts(sortBy, sortOrder))
        .limit(limit)
        .offset(offset);
        
      // Get tags for each post
      const postsWithTags = await Promise.all(
        posts.map(async (post) => {
          const tags = await db
            .select({
              ...getTableColumns(tagTable),
              postsCount: count(postTagTable.id)
            })
            .from(tagTable)
            .innerJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
            .where(eq(postTagTable.postId, post.id))
            .groupBy(tagTable.id);
            
          return {
            ...post,
            tags
          };
        })
      );

      return {
        posts: postsWithTags.map(post => PostSchema.parse(post)),
        total
      };
    },

    async getPostById(id) {
      const post = await db
        .select({
          ...getTableColumns(postTable),
          commentsCount: count(commentTable.id),
          user: getUserFields()
        })
        .from(postTable)
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .leftJoin(userTable, eq(userTable.id, postTable.userId))
        .where(
          and(
            eq(postTable.id, id),
            isNull(postTable.deletedAt)
          )
        )
        .groupBy(postTable.id, userTable.id);
        
      if (post.length === 0) {
        return null;
      }
      
      // Get tags for the post
      const tags = await db
        .select({
          ...getTableColumns(tagTable),
          postsCount: count(postTagTable.id)
        })
        .from(tagTable)
        .innerJoin(postTagTable, eq(postTagTable.tagId, tagTable.id))
        .where(eq(postTagTable.postId, id))
        .groupBy(tagTable.id);
        
      const postWithTags = {
        ...post[0],
        tags
      };
        
      return PostSchema.parse(postWithTags);
    },

    async createPost(data) {
      const post = await db.insert(postTable).values(data).returning();
      
      const result = await db
        .select({
          ...getTableColumns(postTable),
          user: getUserFields()
        })
        .from(postTable)
        .leftJoin(userTable, eq(userTable.id, postTable.userId))
        .where(eq(postTable.id, post[0].id));
      
      return PostSchema.parse(result[0]);
    },

    async updatePostById(id, data) {
      await db
        .update(postTable)
        .set(data)
        .where(eq(postTable.id, id));
      
      const result = await db
        .select({
          ...getTableColumns(postTable),
          user: getUserFields()
        })
        .from(postTable)
        .leftJoin(userTable, eq(userTable.id, postTable.userId))
        .where(eq(postTable.id, id));
      
      return result.length > 0 ? PostSchema.parse(result[0]) : null;
    },

    async deletePostById(id) {
      // Get post with user information before soft deleting
      const post = await db
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
      
      // Soft delete by setting deletedAt to current timestamp
      await db
        .update(postTable)
        .set({ deletedAt: new Date() })
        .where(eq(postTable.id, id));
      
      return PostSchema.parse(post[0]);
    }
  };
}
