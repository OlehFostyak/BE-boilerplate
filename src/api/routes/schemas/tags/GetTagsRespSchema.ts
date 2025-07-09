import { z } from 'zod';
import { TagSchema } from 'src/types/tags/Tag';
import { PaginationMetaSchema } from 'src/api/routes/schemas/PaginationSchema';

export const GetTagsRespSchema = z.object({
  data: z.array(TagSchema),
  meta: PaginationMetaSchema
});
