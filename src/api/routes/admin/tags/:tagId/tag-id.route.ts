import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GetTagByIdRespSchema } from 'src/api/routes/schemas/tags/GetTagByIdRespSchema';
import { UpdateTagReqSchema } from 'src/api/routes/schemas/tags/UpdateTagReqSchema';
import { updateTag } from 'src/controllers/tag/update-tag';
import { deleteTag } from 'src/controllers/tag/delete-tag';
import { z } from 'zod';

const updateTagRoute = {
  schema: {
    params: z.object({
      tagId: z.string().uuid()
    }),
    response: {
      200: GetTagByIdRespSchema
    },
    body: UpdateTagReqSchema
  }
};

const deleteTagRoute = {
  schema: {
    params: z.object({
      tagId: z.string().uuid()
    }),
    response: {
      200: GetTagByIdRespSchema
    }
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  // Update tag (admin only)
  fastify.put('/', updateTagRoute, async (req) => {
    const result = await updateTag({
      tagRepo: fastify.repos.tagRepo,
      id: req.params.tagId,
      data: req.body
    });
    
    return result;
  });

  // Delete tag (admin only)
  fastify.delete('/', deleteTagRoute, async (req) => {
    const result = await deleteTag({
      tagRepo: fastify.repos.tagRepo,
      id: req.params.tagId
    });
    
    return result;
  });
};

export default routes;
