import { eq, count, getTableColumns, or, sql, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IPostRepo } from 'src/types/posts/IPostRepo';
import { Post, PostSchema, GetPostsResult } from 'src/types/posts/Post';
import { postTable, commentTable } from 'src/services/drizzle/schema';
import { PostSortField } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { createSortBuilder } from 'src/services/drizzle/utils/sorting';
import { createCountFilter } from 'src/services/drizzle/utils/filtering';

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
      // Create search condition
      const searchCondition = search
        ? or(
            sql`similarity(${postTable.title}::text, ${search}::text) > 0.1`,
            sql`similarity(${postTable.description}::text, ${search}::text) > 0.1`
          )
        : undefined;
        
      // Create comments count filter condition
      const commentsCountCondition = commentsCountOperator ? createCountFilter(
        commentsCountOperator,
        commentsCountValue,
        db
          .select({ count: count() })
          .from(commentTable)
          .where(eq(commentTable.postId, postTable.id))
      ) : undefined;

      // Create sort function
      const sortPosts = createSortBuilder<PostSortField>({
        title: (direction) => direction(postTable.title),
        createdAt: (direction) => direction(postTable.createdAt),
        commentsCount: (direction) => direction(count(commentTable.id))
      });

      const [{ total }] = await db
        .select({ total: count() })
        .from(postTable)
        .where(and(searchCondition, commentsCountCondition));

      const posts = await db
        .select({
          ...getTableColumns(postTable),
          commentsCount: count(commentTable.id)
        })
        .from(postTable)
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .where(and(searchCondition, commentsCountCondition))
        .groupBy(postTable.id)
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
          commentsCount: count(commentTable.id)
        })
        .from(postTable)
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .where(eq(postTable.id, id))
        .groupBy(postTable.id);
      return post.length > 0 ? PostSchema.parse(post[0]) : null;
    },

    async createPost(data) {
      const post = await db.insert(postTable).values(data as Post).returning();
      return PostSchema.parse(post[0]);
    },

    async updatePostById(id, data) {
      const posts = await db
        .update(postTable)
        .set(data as Post)
        .where(eq(postTable.id, id))
        .returning();
      return posts.length > 0 ? PostSchema.parse(posts[0]) : null;
    },

    async deletePostById(id) {
      const posts = await db.delete(postTable).where(eq(postTable.id, id)).returning();
      return posts.length > 0 ? PostSchema.parse(posts[0]) : null;
    }
  };
}