import { eq, count, getTableColumns, or, sql, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IPostRepo } from 'src/types/posts/IPostRepo';
import { GetPostsResult, PostSchema } from 'src/types/posts/Post';
import { postTable, commentTable, userTable } from 'src/services/drizzle/schema';
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
    sql`similarity(${postTable.title}::text, ${search}::text) > 0.1`,
    sql`similarity(${postTable.description}::text, ${search}::text) > 0.1`
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
      commentsCountValue
    }): Promise<GetPostsResult> {
      // Create comments count filter condition
      const commentsCountCondition = getCommentsCountCondition(
        commentsCountOperator,
        commentsCountValue,
        db
      );

      const [{ total }] = await db
        .select({ total: count() })
        .from(postTable)
        .where(and(searchPosts(search), commentsCountCondition));

      const posts = await db
        .select({
          ...getTableColumns(postTable),
          commentsCount: count(commentTable.id),
          user: getUserFields()
        })
        .from(postTable)
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .leftJoin(userTable, eq(userTable.id, postTable.userId))
        .where(and(searchPosts(search), commentsCountCondition))
        .groupBy(postTable.id, userTable.id)
        .orderBy(sortPosts(sortBy, sortOrder))
        .limit(limit)
        .offset(offset);

      return {
        posts: posts.map(post => PostSchema.parse(post)),
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
        .where(eq(postTable.id, id))
        .groupBy(postTable.id, userTable.id);
      return post.length > 0 ? PostSchema.parse(post[0]) : null;
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
      // Get post with user information before deleting
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
      
      await db.delete(postTable).where(eq(postTable.id, id));
      
      return PostSchema.parse(post[0]);
    }
  };
}
