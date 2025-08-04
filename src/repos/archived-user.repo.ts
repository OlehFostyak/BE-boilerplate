import { eq, or, count, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { archivedUsersTable } from 'src/services/drizzle/schema';
import { IArchivedUserRepo, GetArchivedUsersParams, GetArchivedUsersResult } from 'src/types/archived-users/IArchivedUserRepo';
import { ArchivedUser, CreateArchivedUser, UserArchiveData, ArchivedUserSchema } from 'src/types/archived-users/ArchivedUser';

// Helper function to search archived users using similarity with jsonb
function searchArchivedUsers(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return or(
    sql`similarity((${archivedUsersTable.userData}->>'email')::text, ${search}::text) > 0.3`,
    sql`similarity((${archivedUsersTable.userData}->>'firstName')::text, ${search}::text) > 0.3`,
    sql`similarity((${archivedUsersTable.userData}->>'lastName')::text, ${search}::text) > 0.3`
  );
}

export function getArchivedUserRepo(db: NodePgDatabase): IArchivedUserRepo {
  return {
    async createArchivedUser(data: CreateArchivedUser): Promise<ArchivedUser> {
      const [created] = await db
        .insert(archivedUsersTable)
        .values(data)
        .returning();
      
      return ArchivedUserSchema.parse(created);
    },

    async getArchivedUserByOriginalId(originalUserId: string): Promise<ArchivedUser | null> {
      const [archived] = await db
        .select()
        .from(archivedUsersTable)
        .where(eq(archivedUsersTable.originalUserId, originalUserId));
      
      return archived ? ArchivedUserSchema.parse(archived) : null;
    },

    async getArchivedUsers(): Promise<ArchivedUser[]> {
      const archived = await db
        .select()
        .from(archivedUsersTable)
        .orderBy(desc(archivedUsersTable.archivedAt));
      
      return archived.map(item => ArchivedUserSchema.parse(item));
    },

    async getArchivedUsersWithPagination(params: GetArchivedUsersParams): Promise<GetArchivedUsersResult> {
      const { limit, offset, search } = params;
      
      // Get total count with search filter
      const [{ total }] = await db
        .select({ total: count() })
        .from(archivedUsersTable)
        .where(searchArchivedUsers(search));
      
      // Get paginated results with search
      const archived = await db
        .select()
        .from(archivedUsersTable)
        .where(searchArchivedUsers(search))
        .orderBy(desc(archivedUsersTable.archivedAt))
        .limit(limit)
        .offset(offset);
      
      return {
        archivedUsers: archived.map(item => ArchivedUserSchema.parse(item)),
        total
      };
    },

    async deleteArchivedUser(id: string): Promise<void> {
      await db
        .delete(archivedUsersTable)
        .where(eq(archivedUsersTable.id, id));
    },

    async restoreUserData(
      archivedUser: ArchivedUser
    ): Promise<UserArchiveData> {
      return {
        user: archivedUser.userData,
        posts: archivedUser.postsData || [],
        commentsOnPosts: archivedUser.commentsOnPostsData || [],
        userComments: archivedUser.userCommentsData || []
      };
    }
  };
}