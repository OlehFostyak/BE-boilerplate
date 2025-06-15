import { FastifyRequest, FastifyReply } from 'fastify';
import { CognitoUserPayload, getUserByToken } from 'src/services/aws/cognito';

declare module 'fastify' {
  interface FastifyRequest {
    user?: CognitoUserPayload;
    userId?: string;
  }
}

// Authentication hook for protected routes
export async function authHook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.status(401).send({ error: 'Authorization header is missing' });
    }

    // Check if the authorization header has the correct format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.status(401).send({ error: 'Invalid authorization format' });
    }

    const token = parts[1];
    
    // Verify the token using AWS Cognito API
    // GetUserCommand only works with access tokens
    const user = await getUserByToken(token);
    
    // Add the user to the request object
    request.user = user;
    
    // Use sub as userId
    request.userId = user.sub;
  } catch (error) {
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}
