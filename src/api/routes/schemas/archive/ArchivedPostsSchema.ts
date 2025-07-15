import { z } from 'zod';
import { PaginationQuerySchema } from '../PaginationSchema';
import { PostsSortSchema } from '../posts/PostsSortSchema';
import { CommentsCountFilterSchema } from '../posts/CommentsCountFilterSchema';
import { TagsFilterSchema } from '../posts/TagsFilterSchema';

export const GetArchivedPostsReqSchema = PaginationQuerySchema
  .merge(PostsSortSchema)
  .merge(CommentsCountFilterSchema)
  .merge(TagsFilterSchema)
  .extend({
    search: z.string().optional()
  });

export type GetArchivedPostsReq = z.infer<typeof GetArchivedPostsReqSchema>;

export const ArchivedPostIdParamsSchema = z.object({
  archivedPostId: z.string().uuid()
});

export type ArchivedPostIdParams = z.infer<typeof ArchivedPostIdParamsSchema>;
