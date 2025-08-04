import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from 'src/api/routes/schemas/common/ResponseSchema';
import {
  RestoreUserRespSchema
} from 'src/api/routes/schemas/admin/ArchiveUserSchema';
import { restoreUser } from 'src/controllers/admin/restore-user';
import { z } from 'zod';

const restoreUserRoute = {
  schema: {
    params: z.object({
      archivedUserId: z.string().uuid()
    }),
    response: {
      200: RestoreUserRespSchema,
      404: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  // Restore user from archive
  fastify.get('/restore', restoreUserRoute, async (req) => {
    const result = await restoreUser({
      archivedUserId: req.params.archivedUserId,
      transactionManager: fastify.transactionManager
    });

    return {
      success: true as const,
      data: result
    };
  });
};

export default routes;