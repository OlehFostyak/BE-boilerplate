import { z } from 'zod';
import { PostSchema } from 'src/types/posts/Post';
import { PaginationMetaSchema } from '../PaginationSchema';

export const GetPostsRespSchema = z.object({
  data: z.array(PostSchema),
  meta: PaginationMetaSchema
});
