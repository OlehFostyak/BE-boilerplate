import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import { getUsersAdmin } from '../../../controllers/admin/get-users-admin';
import { deactivateUser } from '../../../controllers/admin/deactivate-user';
import { activateUser } from '../../../controllers/admin/activate-user';
import { inviteUser } from '../../../controllers/admin/invite-user';
import { resendInvite } from '../../../controllers/admin/resend-invite';
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
import {
  InviteUserReqSchema,
  InviteUserRespSchema,
  ResendInviteParamsSchema,
  ResendInviteRespSchema
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

const resendInviteRoute = {
  schema: {
    response: {
      200: ResendInviteRespSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema
    },
    params: ResendInviteParamsSchema
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

  // Invite a new user
  fastify.post('/users/invite', inviteUserRoute, async (req) => {
    const { email } = req.body;

    return await inviteUser({
      userRepo: fastify.repos.userRepo,
      email
    });
  });

  // Resend invitation to a user
  fastify.get('/users/invite/:userId/resend', resendInviteRoute, async (req) => {
    const { userId } = req.params;

    return await resendInvite({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });
};

export default routes;
