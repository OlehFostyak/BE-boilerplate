import { z } from 'zod';

export const GetPostByIdRespSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  commentsCount: z.number(),
  updatedAt: z.date(),
  createdAt: z.date()
});