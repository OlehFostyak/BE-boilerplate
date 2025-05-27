import { eq, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ICommentRepo } from 'src/types/comments/ICommentRepo';
import { CommentSchema } from 'src/types/comments/Comment';
import { commentTable } from 'src/services/drizzle/schema';

export function getCommentRepo(db: NodePgDatabase): ICommentRepo {
  return {
    async getComments(postId: string) {
      const comments = await db
        .select()
        .from(commentTable)
        .where(eq(commentTable.postId, postId))
        .orderBy(desc(commentTable.createdAt));
      return comments.map(comment => CommentSchema.parse(comment));
    },

    async createComment(data) {
      const [newComment] = await db.insert(commentTable).values({
        text: data.text || '',
        postId: data.postId || ''
      } as typeof commentTable.$inferInsert).returning();

      return CommentSchema.parse(newComment);
    },

    async updateCommentById(id, data) {
      const { postId, ...updateData } = data;
      const comments = await db
        .update(commentTable)
        .set(updateData)
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