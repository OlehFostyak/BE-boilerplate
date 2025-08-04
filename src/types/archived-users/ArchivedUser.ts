import { z } from 'zod';

const dateOrStringToDate = z.union([z.date(), z.string()]).transform((val) => {
  return val instanceof Date ? val : new Date(val);
}).nullable();

export const ArchivedUserSchema = z.object({
  id: z.string().uuid(),
  originalUserId: z.string().uuid(),
  userData: z.object({
    id: z.string().uuid(),
    cognitoId: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate
  }),
  postsData: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate,
    tags: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      createdAt: dateOrStringToDate,
      updatedAt: dateOrStringToDate
    }))
  })).nullable(),
  commentsOnPostsData: z.array(z.object({
    id: z.string().uuid(),
    text: z.string(),
    postId: z.string().uuid(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate,
    user: z.object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string()
    })
  })).nullable(),
  userCommentsData: z.array(z.object({
    id: z.string().uuid(),
    text: z.string(),
    postId: z.string().uuid(),
    userId: z.string().uuid().optional(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate
  })).nullable(),
  archivedAt: z.union([z.date(), z.string()]).transform((val) => {
    return val instanceof Date ? val : new Date(val);
  }),
  archivedBy: z.string().uuid()
});

export const CreateArchivedUserSchema = z.object({
  originalUserId: z.string().uuid(),
  userData: z.object({
    id: z.string().uuid(),
    cognitoId: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate
  }),
  postsData: z.array(z.any()).optional(),
  commentsOnPostsData: z.array(z.any()).optional(),
  userCommentsData: z.array(z.any()).optional(),
  archivedBy: z.string().uuid()
});

export const UserArchiveDataSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    cognitoId: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate
  }),
  posts: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate,
    tags: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      createdAt: dateOrStringToDate,
      updatedAt: dateOrStringToDate
    }))
  })).optional(),
  commentsOnPosts: z.array(z.object({
    id: z.string().uuid(),
    text: z.string(),
    postId: z.string().uuid(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate,
    user: z.object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string()
    })
  })).optional(),
  userComments: z.array(z.object({
    id: z.string().uuid(),
    text: z.string(),
    postId: z.string().uuid(),
    userId: z.string().uuid().optional(),
    createdAt: dateOrStringToDate,
    updatedAt: dateOrStringToDate
  })).optional()
});

export type ArchivedUser = z.infer<typeof ArchivedUserSchema>;
export type CreateArchivedUser = z.infer<typeof CreateArchivedUserSchema>;
export type UserArchiveData = z.infer<typeof UserArchiveDataSchema>;