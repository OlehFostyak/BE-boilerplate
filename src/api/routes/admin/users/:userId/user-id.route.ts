import { z } from 'zod';
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { adminOnly } from 'src/api/hooks/adminOnly.hook';
import { 
  DeactivateUserRespSchema,
  ErrorResponseSchema
} from 'src/api/routes/schemas/admin/AdminSchema';
import {
  ResendInviteRespSchema
} from 'src/api/routes/schemas/admin/InviteUserSchema';
import { deactivateUser } from 'src/controllers/admin/deactivate-user';
import { activateUser } from 'src/controllers/admin/activate-user';
import { resendInvite } from 'src/controllers/admin/invite-user';

const userOperationRoute = {
  schema: {
    params: z.object({
      userId: z.string().uuid()
    }),
    response: {
      200: DeactivateUserRespSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

const resendInviteRoute = {
  schema: {
    params: z.object({
      userId: z.string().uuid()
    }),
    response: {
      200: ResendInviteRespSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.get('/deactivate', userOperationRoute, async (req) => {
    const { userId } = req.params;

    return await deactivateUser({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });

  fastify.get('/activate', userOperationRoute, async (req) => {
    const { userId } = req.params;

    return await activateUser({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });

  // Resend invitation to a user
  fastify.get('/invite/resend', resendInviteRoute, async (req) => {
    const { userId } = req.params;

    return await resendInvite({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });
};

export default routes;
