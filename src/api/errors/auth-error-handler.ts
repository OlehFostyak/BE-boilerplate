import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import {
  AuthError,
  InvalidCredentialsError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidConfirmationCodeError,
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
  PasswordPolicyError
} from 'src/types/errors/auth';

/**
 * Error handler for authentication errors
 */
export function authErrorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log the error for debugging
  request.log.error(error);

  // Handle specific authentication errors
  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error.message
    });
  }

  if (error instanceof UserNotFoundError) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: error.message
    });
  }

  if (error instanceof UserAlreadyExistsError) {
    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: error.message
    });
  }

  if (error instanceof InvalidConfirmationCodeError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message
    });
  }

  if (error instanceof TokenExpiredError) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error.message
    });
  }

  if (error instanceof InvalidTokenError) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error.message
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error.message
    });
  }

  if (error instanceof PasswordPolicyError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message
    });
  }

  if (error instanceof AuthError) {
    return reply.status(500).send({
      statusCode: 500,
      error: 'Authentication Error',
      message: error.message
    });
  }

  // If it's not a specific auth error, let Fastify handle it
  return reply;
}
