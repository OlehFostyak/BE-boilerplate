import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ErrorResponseSchema, UserProfileResponseSchema, getUserByIdRoute, getUserProfileRoute, GetUserByIdParams } from 'src/api/routes/schemas/user/UserSchema';
import { UnauthorizedError } from 'src/types/errors/auth';
import { getUserById } from 'src/controllers/user/get-user-by-id';
import { IUserRepo } from 'src/types/users/IUserRepo';
import { CognitoUserPayload } from 'src/services/aws/cognito';
import { UserRole } from 'src/types/users/User';

// Extend FastifyInstance with repos
declare module 'fastify' {
  interface FastifyInstance {
    repos: {
      userRepo: IUserRepo;
      [key: string]: any;
    };
  }
}

// Using getUserProfileRoute imported from UserSchema.ts

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.get('/', getUserProfileRoute, async (request, reply) => {
    if (!request.userId || !request.user?.email) {
      throw new UnauthorizedError('User not authenticated');
    }

    return {
      id: request.userId,
      email: request.user.email,
      firstName: request.user.given_name || null,
      lastName: request.user.family_name || null,
      role: request.userRole
    };
  });

  typedFastify.get('/:userId', getUserByIdRoute, async (request, reply) => {
    const { userId } = request.params as GetUserByIdParams;
    
    return await getUserById({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });
};

export default routes;
