import { z } from 'zod';

export const CreatePostReqSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  tagIds: z.string().uuid().array().optional()
});