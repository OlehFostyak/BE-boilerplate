import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getUserByIdRoute, getUserProfileRoute, GetUserByIdParams } from 'src/api/routes/schemas/user/UserSchema';
import { UnauthorizedError } from 'src/types/errors/auth';
import { getUserById } from 'src/controllers/user/get-user-by-id';
import { IUserRepo } from 'src/types/users/IUserRepo';
import { HttpError } from 'src/api/errors/HttpError';

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

const routes: FastifyPluginAsync = async (f): Promise<void> => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.get('/', getUserProfileRoute, async (request) => {
    if (!request.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Get the user from the database to ensure we have the correct data structure
    const user = await fastify.repos.userRepo.getUserById(request.userId);
    if (!user) {
      throw new HttpError(404, 'User not found in database');
    }

    // Create the response object
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      role: user.role
    };
  });

  fastify.get('/:userId', getUserByIdRoute, async (request) => {
    const { userId } = request.params as GetUserByIdParams;
    
    return await getUserById({
      userRepo: fastify.repos.userRepo,
      userId
    });
  });
};

export default routes;
