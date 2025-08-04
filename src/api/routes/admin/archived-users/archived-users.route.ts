import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from 'src/api/routes/schemas/common/ResponseSchema';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import {
  GetArchivedUsersRespSchema,
  ArchivedUserSearchSchema
} from 'src/api/routes/schemas/admin/ArchiveUserSchema';
import { getArchivedUsers } from 'src/controllers/admin/get-archived-users';
import { getPaginatedResponse } from 'src/api/utils/pagination';

const getArchivedUsersRoute = {
  schema: {
    response: {
      200: GetArchivedUsersRespSchema,
      500: ErrorResponseSchema
    },
    querystring: PaginationQuerySchema.merge(ArchivedUserSearchSchema)
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  // Get all archived users (with pagination)
  fastify.get('/', getArchivedUsersRoute, async (req) => {
    const { limit, offset, search } = req.query;

    const { archivedUsers, total } = await getArchivedUsers({
      archivedUserRepo: fastify.repos.archivedUserRepo,
      limit,
      offset,
      search
    });

    return getPaginatedResponse(archivedUsers, total, limit, offset);
  });
};

export default routes;