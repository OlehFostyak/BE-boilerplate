import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GetTagsRespSchema } from 'src/api/routes/schemas/tags/GetTagsRespSchema';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import { TagsSortSchema } from 'src/api/routes/schemas/tags/TagsSortSchema';
import { getTags } from 'src/controllers/tag/get-tags';
import { getPaginatedResponse } from 'src/api/utils/pagination';

const getTagsRoute = {
  schema: {
    response: {
      200: GetTagsRespSchema
    },
    querystring: PaginationQuerySchema.merge(TagsSortSchema)
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  // Get all tags with pagination and search
  fastify.get('/', getTagsRoute, async (req) => {
    const {
      limit,
      offset,
      search,
      sortBy,
      sortOrder
    } = req.query;

    const { tags, total } = await getTags({
      tagRepo: fastify.repos.tagRepo,
      limit,
      offset,
      search,
      sortBy,
      sortOrder
    });

    return getPaginatedResponse(tags, total, limit, offset);
  });
};

export default routes;
