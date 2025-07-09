import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreateTagReqSchema } from 'src/api/routes/schemas/tags/CreateTagReqSchema';
import { GetTagByIdRespSchema } from 'src/api/routes/schemas/tags/GetTagByIdRespSchema';
import { createTag } from 'src/controllers/tag/create-tag';

const createTagRoute = {
  schema: {
    response: {
      200: GetTagByIdRespSchema
    },
    body: CreateTagReqSchema
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  // Create tag (admin only)
  fastify.post('/', createTagRoute, async (req) => {
    const result = await createTag({
      tagRepo: fastify.repos.tagRepo,
      data: req.body
    });

    return result;
  });
};

export default routes;
