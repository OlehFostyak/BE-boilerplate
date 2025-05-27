import { z } from 'zod';

export const CreateCommentReqSchema = z.object({
  text: z.string()
});