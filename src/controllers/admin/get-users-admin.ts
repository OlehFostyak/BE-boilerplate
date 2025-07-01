import { GetUsersAdminParams } from 'src/types/users/User';

export async function getUsersAdmin(params: GetUsersAdminParams) {
  // Use getUsersWithStatus to include Cognito status in the response
  return params.userRepo.getUsersWithStatus({
    limit: params.limit,
    offset: params.offset,
    search: params.search
  });
}
