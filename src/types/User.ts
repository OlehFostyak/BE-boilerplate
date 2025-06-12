import { userTable } from '../services/drizzle/schema';

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;
