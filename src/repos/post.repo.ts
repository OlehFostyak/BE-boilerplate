import { eq, count, getTableColumns } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IPostRepo } from 'src/types/IPostRepo';
import { Post, PostSchema } from 'src/types/Post';
import { postTable, commentTable } from 'src/services/drizzle/schema';

export function getPostRepo(db: NodePgDatabase): IPostRepo {
  return {
    async getPosts() {
      const posts = await db
        .select({
          ...getTableColumns(postTable),
          commentsCount: count(commentTable.id)
        })
        .from(postTable)
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .groupBy(postTable.id);
      return posts.map(post => PostSchema.parse(post));
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
      await db.delete(postTable).where(eq(postTable.id, id));
    }
  };
}