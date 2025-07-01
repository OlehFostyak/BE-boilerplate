import { userTable } from 'src/services/drizzle/schema';

// Use the inferred type from the schema
export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;
