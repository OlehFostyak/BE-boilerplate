import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { getUserByToken } from 'src/services/aws/cognito';
import { UnauthorizedError } from 'src/types/errors/auth';

/**
 * Plugin to register authentication middleware
 */
const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Register a decorator to store the authenticated user
  fastify.decorateRequest('user', undefined);

  // Register a hook to verify JWT token for protected routes
  fastify.addHook('onRequest', async (request, _reply) => {
    // Skip authentication for public routes
    const url = request.url;
    if (
      url.startsWith('/api/public') ||
      url.startsWith('/api/auth') ||
      url === '/api/health' ||
      url.startsWith('/api/documentation')
    ) {
      return;
    }

    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new UnauthorizedError('No token provided');
      }

      const user = await getUserByToken(token);
      
      // Add the user to the request object
      request.user = user;
      
      // Use sub as userId
      request.userId = user.sub;
    } catch (_error) {
      // Let the error handler handle the error
      throw new UnauthorizedError('Invalid or expired token');
    }
  });
};

export default fp(authPlugin);
