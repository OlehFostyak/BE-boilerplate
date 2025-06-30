import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import { getUsersAdmin } from '../../../controllers/admin/get-users-admin';
import { deactivateUser } from '../../../controllers/admin/deactivate-user';
import { activateUser } from '../../../controllers/admin/activate-user';
import { getPaginatedResponse } from 'src/api/utils/pagination';
import { adminOnly } from '../../hooks/adminOnly.hook';
import { 
  GetUsersAdminRespSchema,
  DeactivateUserRespSchema,
  ActivateUserRespSchema,
  ErrorResponseSchema,
  UserSearchSchema,
  UserIdQuerySchema
} from 'src/api/routes/schemas/admin/AdminSchema';

const getUsersAdminRoute = {
  schema: {
    response: {
      200: GetUsersAdminRespSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema
    },
    querystring: PaginationQuerySchema.merge(UserSearchSchema)
  }
};

const userOperationRoute = {
  schema: {
    response: {
      200: DeactivateUserRespSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema
    },
    params: UserIdQuerySchema
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.addHook('preHandler', adminOnly);

  fastify.get('/users', getUsersAdminRoute, async (req) => {
    const { limit, offset, search } = req.query;

    const { users, total } = await getUsersAdmin({
      userRepo: fastify.repos.userRepo,
      limit,
      offset,
      search
    });

    return getPaginatedResponse(users, total, limit, offset);
  });

  fastify.get('/users/:userId/deactivate', userOperationRoute, async (req) => {
    const { userId } = req.params;

    return await deactivateUser({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });

  fastify.get('/users/:userId/activate', userOperationRoute, async (req) => {
    const { userId } = req.params;

    return await activateUser({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });
};

export default routes;
