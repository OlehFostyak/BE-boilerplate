import { uuid, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const entityTable = pgTable('entities', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const postTable = pgTable('posts', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});
