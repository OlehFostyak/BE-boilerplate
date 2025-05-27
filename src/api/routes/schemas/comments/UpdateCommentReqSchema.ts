import { z } from 'zod';

export const UpdateCommentReqSchema = z.object({
  text: z.string().optional()
});