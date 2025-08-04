import { eq, desc, getTableColumns } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ICommentRepo } from 'src/types/comments/ICommentRepo';
import { CommentSchema } from 'src/types/comments/Comment';
import { commentTable, userTable } from 'src/services/drizzle/schema';
import { getUserFields } from 'src/services/drizzle/utils/user-fields';

export function getCommentRepo(db: NodePgDatabase): ICommentRepo {
  return {
    async getComments(postId) {
      const comments = await db
        .select({
          ...getTableColumns(commentTable),
          user: getUserFields()
        })
        .from(commentTable)
        .leftJoin(userTable, eq(userTable.id, commentTable.userId))
        .where(eq(commentTable.postId, postId))
        .orderBy(desc(commentTable.createdAt));
      return comments.map(comment => CommentSchema.parse(comment));
    },

    async createComment(data) {
      const [newComment] = await db.insert(commentTable).values(data).returning();

      const result = await db
        .select({
          ...getTableColumns(commentTable),
          user: getUserFields()
        })
        .from(commentTable)
        .leftJoin(userTable, eq(userTable.id, commentTable.userId))
        .where(eq(commentTable.id, newComment.id));

      return CommentSchema.parse(result[0]);
    },

    async getCommentById(id) {
      const result = await db
        .select({
          ...getTableColumns(commentTable),
          user: getUserFields()
        })
        .from(commentTable)
        .leftJoin(userTable, eq(userTable.id, commentTable.userId))
        .where(eq(commentTable.id, id));
      
      return result.length > 0 ? CommentSchema.parse(result[0]) : null;
    },

    async updateCommentById(id, data) {
      await db
        .update(commentTable)
        .set(data)
        .where(eq(commentTable.id, id));
      
      const result = await db
        .select({
          ...getTableColumns(commentTable),
          user: getUserFields()
        })
        .from(commentTable)
        .leftJoin(userTable, eq(userTable.id, commentTable.userId))
        .where(eq(commentTable.id, id));
      
      return result.length > 0 ? CommentSchema.parse(result[0]) : null;
    },

    async deleteCommentById(id) {
      // Get the comment with user information before deleting
      const comment = await db
        .select({
          ...getTableColumns(commentTable),
          user: getUserFields(),
          postId: commentTable.postId
        })
        .from(commentTable)
        .leftJoin(userTable, eq(userTable.id, commentTable.userId))
        .where(eq(commentTable.id, id));
      
      if (comment.length === 0) {
        return null; // Comment not found
      }
      
      // Delete the comment
      await db.delete(commentTable).where(eq(commentTable.id, id));
      
      return CommentSchema.parse(comment[0]);
    },

    async getAllCommentsByUserId(userId) {
      const comments = await db
        .select({
          ...getTableColumns(commentTable),
          user: getUserFields()
        })
        .from(commentTable)
        .leftJoin(userTable, eq(userTable.id, commentTable.userId))
        .where(eq(commentTable.userId, userId))
        .orderBy(desc(commentTable.createdAt));
        
      return comments.map(comment => CommentSchema.parse(comment));
    }
  };
}
