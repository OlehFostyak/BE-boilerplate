import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ArchivedPostIdParamsSchema, GetArchivedPostsReqSchema } from 'src/api/routes/schemas/archive/ArchivedPostsSchema';
import { z } from 'zod';
import { GetArchivedPostsRespSchema } from 'src/api/routes/schemas/archive/GetArchivedPostsRespSchema';
import { getArchivedPosts } from 'src/controllers/archive/get-archived-posts';
import { restoreArchivedPost } from 'src/controllers/archive/restore-archived-post';
import { deleteArchivedPost } from 'src/controllers/archive/delete-archived-post';
import { getPaginatedResponse } from 'src/api/utils/pagination';

// Define route schemas
const getArchivedPostsRoute = {
  schema: {
    querystring: GetArchivedPostsReqSchema,
    response: {
      200: GetArchivedPostsRespSchema
    }
  }
};

const restoreArchivedPostRoute = {
  schema: {
    params: ArchivedPostIdParamsSchema,
    response: {
      200: z.object({
        success: z.boolean(),
        postId: z.string().uuid()
      })
    }
  }
};

const deleteArchivedPostRoute = {
  schema: {
    params: ArchivedPostIdParamsSchema,
    response: {
      200: z.object({
        success: z.boolean()
      })
    }
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.get('/', getArchivedPostsRoute, async (req) => {
    const {
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
      commentsCountOperator,
      commentsCountValue,
      tagIds
    } = req.query;
    
    const { posts, total } = await getArchivedPosts({
      archiveRepo: fastify.repos.archiveRepo,
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
      commentsCountOperator,
      commentsCountValue,
      tagIds
    });
    
    return getPaginatedResponse(posts, total, limit, offset);
  });

  fastify.get('/:archivedPostId/restore', restoreArchivedPostRoute, async (req) => {
    return restoreArchivedPost({
      archiveRepo: fastify.repos.archiveRepo,
      archivedPostId: req.params.archivedPostId
    });
  });

  fastify.delete('/:archivedPostId', deleteArchivedPostRoute, async (req) => {
    return deleteArchivedPost({
      archiveRepo: fastify.repos.archiveRepo,
      archivedPostId: req.params.archivedPostId
    });
  });
};

export default routes;
