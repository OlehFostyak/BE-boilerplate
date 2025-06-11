import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { userTable } from 'src/services/drizzle/schema';
import { IUserRepo } from 'src/types/users/IUserRepo';

export function getUserRepo(db: NodePgDatabase): IUserRepo {
  return {
    async createUser(user) {
      const [createdUser] = await db.insert(userTable).values(user).returning();
      return createdUser;
    },

    async getUserById(id) {
      const [user] = await db.select().from(userTable).where(eq(userTable.id, id));
      return user;
    },

    async getUserByCognitoId(cognitoId) {
      const [user] = await db.select().from(userTable).where(eq(userTable.cognitoId, cognitoId));
      return user;
    },

    async getUserByEmail(email) {
      const [user] = await db.select().from(userTable).where(eq(userTable.email, email));
      return user;
    },

    async updateUser(id, userData) {
      const [updatedUser] = await db
        .update(userTable)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(userTable.id, id))
        .returning();
      return updatedUser;
    },

    async deleteUser(id) {
      await db.delete(userTable).where(eq(userTable.id, id));
    }
  };
}
