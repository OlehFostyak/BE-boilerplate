import { FastifyRequest, FastifyReply } from 'fastify';
import { CognitoUserPayload, getUserByToken } from 'src/services/aws/cognito';
import { UnauthorizedError } from 'src/types/errors/auth';
import { getUserRepo } from 'src/repos/user.repo';

declare module 'fastify' {
  interface FastifyRequest {
    user?: CognitoUserPayload;
    userId?: string;
  }
}

/**
 * Authentication hook for protected routes
 */
export async function authHook(
  request: FastifyRequest, 
  reply: FastifyReply
) {
  // Check if the route is marked to skip authentication
  const routeConfig = request.routeOptions?.config as { skipAuthHook?: boolean } | undefined;
  
  // Skip authentication for routes marked with skipAuthHook
  if (routeConfig?.skipAuthHook === true) {
    return;
  }

  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const cognitoUser = await getUserByToken(token);
    
    if (!cognitoUser.sub) {
      throw new UnauthorizedError('User ID not found in token');
    }
    
    // Get the user from database to verify they exist
    const db = (request as any).server?.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const dbUser = await getUserRepo(db).getUserByCognitoId(cognitoUser.sub);
    
    if (!dbUser) {
      throw new UnauthorizedError('User not found in database');
    }
    
    request.user = cognitoUser;
    request.userId = dbUser.id;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ error: error.message });
    }
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}
