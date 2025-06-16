import { eq, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ICommentRepo } from 'src/types/comments/ICommentRepo';
import { CommentSchema } from 'src/types/comments/Comment';
import { commentTable } from 'src/services/drizzle/schema';

export function getCommentRepo(db: NodePgDatabase): ICommentRepo {
  return {
    async getComments(postId) {
      const comments = await db
        .select()
        .from(commentTable)
        .where(eq(commentTable.postId, postId))
        .orderBy(desc(commentTable.createdAt));
      return comments.map(comment => CommentSchema.parse(comment));
    },

    async createComment(data) {
      const [newComment] = await db.insert(commentTable).values(data).returning();

      return CommentSchema.parse(newComment);
    },

    async updateCommentById(id, data) {
      const comments = await db
        .update(commentTable)
        .set(data)
        .where(eq(commentTable.id, id))
        .returning();
      return comments.length > 0 ? CommentSchema.parse(comments[0]) : null;
    },

    async deleteCommentById(id) {
      const [comment] = await db
        .select({
          postId: commentTable.postId
        })
        .from(commentTable)
        .where(eq(commentTable.id, id));

      if (!comment) {return;}

      await db.delete(commentTable).where(eq(commentTable.id, id));

    }
  };
}