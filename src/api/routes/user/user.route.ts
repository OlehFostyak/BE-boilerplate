import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ErrorResponseSchema, UserProfileResponseSchema } from 'src/api/routes/schemas/user/ProfileSchema';
import { UnauthorizedError } from 'src/types/errors/auth';

const getUserProfileRoute = {
  schema: {
    response: {
      200: UserProfileResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.get('/', getUserProfileRoute, async (request) => {
    if (!request.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    // Use userId from request or sub from token
    const userId = request.userId || request.user.sub;

    return {
      id: userId,
      email: request.user.email,
      firstName: request.user.given_name ? String(request.user.given_name) : null,
      lastName: request.user.family_name ? String(request.user.family_name) : null
    };

  });
};

export default routes;
