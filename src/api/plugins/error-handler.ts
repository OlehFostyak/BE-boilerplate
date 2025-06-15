import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { authErrorHandler } from 'src/api/errors/auth-error-handler';
import { AuthError } from 'src/types/errors/auth';

/**
 * Plugin to register global error handlers
 */
const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  // Register auth error handler for authentication errors
  fastify.setErrorHandler((error, request, reply) => {
    // If it's an authentication error, use our custom handler
    if (error instanceof AuthError) {
      return authErrorHandler(error, request, reply);
    }

    // For other errors, use default Fastify error handler
    return reply.send(error);
  });
};

export default fp(errorHandlerPlugin);
