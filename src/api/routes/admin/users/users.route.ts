import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import { getUsersAdmin } from 'src/controllers/admin/get-users-admin';
import { inviteUser } from 'src/controllers/admin/invite-user';
import { getPaginatedResponse } from 'src/api/utils/pagination';
import { 
  GetUsersAdminRespSchema,
  ErrorResponseSchema,
  UserSearchSchema
} from 'src/api/routes/schemas/admin/AdminSchema';
import {
  InviteUserReqSchema,
  InviteUserRespSchema
} from 'src/api/routes/schemas/admin/InviteUserSchema';

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

const inviteUserRoute = {
  schema: {
    body: InviteUserReqSchema,
    response: {
      200: InviteUserRespSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  // Get all users (with pagination)
  fastify.get('/', getUsersAdminRoute, async (req) => {
    const { limit, offset, search } = req.query;

    const { users, total } = await getUsersAdmin({
      userRepo: fastify.repos.userRepo,
      limit,
      offset,
      search
    });

    return getPaginatedResponse(users, total, limit, offset);
  });

  // Invite a new user
  fastify.post('/invite', inviteUserRoute, async (req) => {
    const { email } = req.body;

    return await inviteUser({
      userRepo: fastify.repos.userRepo,
      email
    });
  });
};

export default routes;
