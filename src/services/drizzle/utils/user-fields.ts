import { userTable } from 'src/services/drizzle/schema';

export function getUserFields() {
  return {
    id: userTable.id,
    email: userTable.email,
    firstName: userTable.firstName,
    lastName: userTable.lastName,
    cognitoId: userTable.cognitoId,
    role: userTable.role,
    createdAt: userTable.createdAt,
    updatedAt: userTable.updatedAt
  };
}
