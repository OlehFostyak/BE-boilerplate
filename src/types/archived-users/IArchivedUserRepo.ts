import { ArchivedUser, CreateArchivedUser, UserArchiveData } from './ArchivedUser';

export interface GetArchivedUsersParams {
  limit: number;
  offset: number;
  search?: string;
}

export interface GetArchivedUsersResult {
  archivedUsers: ArchivedUser[];
  total: number;
}

export interface IArchivedUserRepo {
  createArchivedUser(data: CreateArchivedUser): Promise<ArchivedUser>;
  getArchivedUserByOriginalId(originalUserId: string): Promise<ArchivedUser | null>;
  getArchivedUsers(): Promise<ArchivedUser[]>;
  getArchivedUsersWithPagination(params: GetArchivedUsersParams): Promise<GetArchivedUsersResult>;
  deleteArchivedUser(id: string): Promise<void>;
  restoreUserData(archivedUser: ArchivedUser): Promise<UserArchiveData>;
}