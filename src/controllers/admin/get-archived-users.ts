import { IArchivedUserRepo } from 'src/types/archived-users/IArchivedUserRepo';

export interface GetArchivedUsersParams {
  archivedUserRepo: IArchivedUserRepo;
  limit: number;
  offset: number;
  search?: string;
}

export async function getArchivedUsers(params: GetArchivedUsersParams) {
  const { archivedUserRepo, limit, offset, search } = params;

  const { archivedUsers, total } = await archivedUserRepo.getArchivedUsersWithPagination({
    limit,
    offset,
    search
  });
  
  // Parse user data to include basic info for display
  const processedUsers = archivedUsers.map(archived => {
    return {
      id: archived.id,
      originalUserId: archived.originalUserId,
      userData: archived.userData,
      archivedAt: archived.archivedAt,
      archivedBy: archived.archivedBy
    };
  });

  return { archivedUsers: processedUsers, total };
}