import { z } from 'zod';
import { ArchivedPostSchema } from 'src/types/archive/ArchivedPost';
import { PaginationMetaSchema } from 'src/api/routes/schemas/PaginationSchema';

export const GetArchivedPostsRespSchema = z.object({
  data: z.array(ArchivedPostSchema),
  meta: PaginationMetaSchema
});
