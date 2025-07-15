import { uuid, pgTable, varchar, text, timestamp, json } from 'drizzle-orm/pg-core';
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
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp()
});

export const commentTable = pgTable('comments', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  text: text().notNull(),
  postId: uuid().references(() => postTable.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid().references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const tagTable = pgTable('tags', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar({ length: 50 }).notNull().unique(),
  description: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const postTagTable = pgTable('post_tags', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  postId: uuid().references(() => postTable.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid().references(() => tagTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow()
});

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postTable),
  comments: many(commentTable)
}));

export const postRelations = relations(postTable, ({ many, one }) => ({
  comments: many(commentTable),
  tags: many(postTagTable),
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

export const tagRelations = relations(tagTable, ({ many }) => ({
  posts: many(postTagTable)
}));

export const postTagRelations = relations(postTagTable, ({ one }) => ({
  post: one(postTable, {
    fields: [postTagTable.postId],
    references: [postTable.id]
  }),
  tag: one(tagTable, {
    fields: [postTagTable.tagId],
    references: [tagTable.id]
  })
}));

// Archive tables
export const archivedPostTable = pgTable('archived_posts', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  originalId: uuid().notNull(), // Original post ID
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  userId: uuid().references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
  archivedAt: timestamp().defaultNow()
});

export const archivedCommentTable = pgTable('archived_comments', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  originalId: uuid().notNull(), // Original comment ID
  text: text().notNull(),
  postId: uuid().references(() => archivedPostTable.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid().references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
  archivedAt: timestamp().defaultNow()
});

// Archive relations
export const archivedUserRelations = relations(userTable, ({ many }) => ({
  archivedPosts: many(archivedPostTable),
  archivedComments: many(archivedCommentTable)
}));

export const archivedPostTagTable = pgTable('archived_post_tags', {
  id: uuid().primaryKey().default(sql`uuid_generate_v4()`),
  archivedPostId: uuid().references(() => archivedPostTable.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid().references(() => tagTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow()
});

export const archivedPostRelations = relations(archivedPostTable, ({ one, many }) => ({
  comments: many(archivedCommentTable),
  tags: many(archivedPostTagTable),
  user: one(userTable, {
    fields: [archivedPostTable.userId],
    references: [userTable.id]
  })
}));

export const archivedPostTagRelations = relations(archivedPostTagTable, ({ one }) => ({
  archivedPost: one(archivedPostTable, {
    fields: [archivedPostTagTable.archivedPostId],
    references: [archivedPostTable.id]
  }),
  tag: one(tagTable, {
    fields: [archivedPostTagTable.tagId],
    references: [tagTable.id]
  })
}));

export const archivedCommentRelations = relations(archivedCommentTable, ({ one }) => ({
  post: one(archivedPostTable, {
    fields: [archivedCommentTable.postId],
    references: [archivedPostTable.id]
  }),
  user: one(userTable, {
    fields: [archivedCommentTable.userId],
    references: [userTable.id]
  })
}));
