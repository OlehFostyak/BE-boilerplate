import { uuid, pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

export const userTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  cognitoId: text('cognito_id').notNull().unique(),
  email: text('email').notNull().unique(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 50 }).default('user').notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const postTable = pgTable('posts', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  userId: uuid().references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const commentTable = pgTable('comments', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  text: text().notNull(),
  postId: uuid().references(() => postTable.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid().references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postTable),
  comments: many(commentTable)
}));

export const postRelations = relations(postTable, ({ many, one }) => ({
  comments: many(commentTable),
  user: one(userTable, {
    fields: [postTable.userId],
    references: [userTable.id]
  })
}));

export const commentRelations = relations(commentTable, ({ one }) => ({
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.id]
  }),
  user: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.id]
  })
}));
