import { z } from 'zod';

export const GetPostByIdRespSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  updatedAt: z.date(),
  createdAt: z.date()
});