import { eq, count, or, sql, getTableColumns } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { userTable } from 'src/services/drizzle/schema';
import { IUserRepo } from 'src/types/users/IUserRepo';
import { GetUsersResult, UserWithStatus } from 'src/types/users/User';
import { getUserStatus } from 'src/services/aws/cognito/modules/user';

// Helper function to search users
function searchUsers(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return or(
    sql`similarity(${userTable.email}::text, ${search}::text) > 0.3`,
    sql`similarity(${userTable.firstName}::text, ${search}::text) > 0.3`,
    sql`similarity(${userTable.lastName}::text, ${search}::text) > 0.3`
  );
}

export function getUserRepo(db: NodePgDatabase): IUserRepo {
  // Helper function to add Cognito status to a user
  async function addCognitoStatusToUser(user: any): Promise<UserWithStatus | undefined> {
    if (!user) return undefined;
    
    try {
      const statusResult = await getUserStatus({ email: user.email });
      return {
        ...user,
        status: statusResult.status,
        enabled: statusResult.enabled
      };
    } catch (error) {
      console.error('Error getting Cognito status:', error);
      return user;
    }
  }
  
  return {
    async createUser(user) {
      const [createdUser] = await db.insert(userTable).values(user).returning();
      return createdUser;
    },

    async getUserById(id) {
      const [user] = await db.select().from(userTable).where(eq(userTable.id, id));
      if (user) {
        // Add Cognito status to user
        return await addCognitoStatusToUser(user);
      }
      return user;
    },

    async getUserByCognitoId(cognitoId) {
      const [user] = await db.select().from(userTable).where(eq(userTable.cognitoId, cognitoId));
      return user;
    },

    async getUserByEmail(email) {
      const [user] = await db.select().from(userTable).where(eq(userTable.email, email));
      if (user) {
        // Add Cognito status to user
        return await addCognitoStatusToUser(user);
      }
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
    },
    
    async getUsers({ limit, offset, search }): Promise<GetUsersResult> {
      // Get total count with search filter
      const [{ total }] = await db
        .select({ total: count() })
        .from(userTable)
        .where(searchUsers(search));
      
      // Get users with pagination and search
      const dbUsers = await db
        .select(getTableColumns(userTable))
        .from(userTable)
        .where(searchUsers(search))
        .orderBy(userTable.createdAt)
        .limit(limit)
        .offset(offset);
      
      return {
        users: dbUsers,
        total
      };
    },
    
    // getUsersWithStatus method to get users with Cognito status
    async getUsersWithStatus({ limit, offset, search }) {
      // Get total count with search filter
      const [{ total }] = await db
        .select({ total: count() })
        .from(userTable)
        .where(searchUsers(search));
      
      // Get users with pagination and search
      const dbUsers = await db
        .select(getTableColumns(userTable))
        .from(userTable)
        .where(searchUsers(search))
        .orderBy(userTable.createdAt)
        .limit(limit)
        .offset(offset);
      
      // Add Cognito status to each user
      const usersWithStatus = await Promise.all(
        dbUsers.map(user => addCognitoStatusToUser(user))
      );
      
      return {
        users: usersWithStatus.filter(Boolean) as UserWithStatus[],
        total
      };
    }
  };
}
