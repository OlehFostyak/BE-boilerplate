import { GetUsersAdminParams } from 'src/types/users/User';

export async function getUsersAdmin(params: GetUsersAdminParams) {
  return params.userRepo.getUsers({
    limit: params.limit,
    offset: params.offset,
    search: params.search
  });
}
