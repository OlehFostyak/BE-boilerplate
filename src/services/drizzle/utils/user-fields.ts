import { userTable } from 'src/services/drizzle/schema';

/**
 * Повертає об'єкт з полями користувача для використання в запитах до бази даних
 */
export function getUserFields() {
  return {
    id: userTable.id,
    email: userTable.email,
    firstName: userTable.firstName,
    lastName: userTable.lastName
  };
}
