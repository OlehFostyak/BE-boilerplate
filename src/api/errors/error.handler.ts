import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpError } from './HttpError';
import util from 'util';
import { EErrorCodes } from './EErrorCodes';
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

/*
We use HttpError only if we want to throw an error with a specific status code and error code.
So no need to write try/catch block for every route.
But take into account that logs will be used to build error metrics.
Metric label format will be next {error.type}_${error.cause.type}
*/

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = function (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  let errorCode = EErrorCodes.GENERAL_ERROR;
  let statusCode = 400;
  let message = 'Bad Request';

  // Handle authentication errors
  if (error instanceof InvalidCredentialsError) {
    statusCode = 401;
    message = error.message;
    errorCode = EErrorCodes.UNAUTHORIZED;
  } else if (error instanceof UserNotFoundError) {
    statusCode = 404;
    message = error.message;
    errorCode = EErrorCodes.NOT_FOUND;
  } else if (error instanceof UserAlreadyExistsError) {
    statusCode = 409;
    message = error.message;
    errorCode = EErrorCodes.CONFLICT;
  } else if (error instanceof InvalidConfirmationCodeError) {
    statusCode = 400;
    message = error.message;
    errorCode = EErrorCodes.BAD_REQUEST;
  } else if (error instanceof TokenExpiredError || error instanceof InvalidTokenError || error instanceof UnauthorizedError) {
    statusCode = 401;
    message = error.message;
    errorCode = EErrorCodes.UNAUTHORIZED;
  } else if (error instanceof PasswordPolicyError) {
    statusCode = 400;
    message = error.message;
    errorCode = EErrorCodes.BAD_REQUEST;
  } else if (error instanceof AuthError) {
    statusCode = 500;
    message = error.message;
    errorCode = EErrorCodes.GENERAL_ERROR;
  } else if (error instanceof HttpError) {
    if (error.errorCode) {
      errorCode = error.errorCode;
    }
    statusCode = error.statusCode;
    message = error.message;
  }

  // handle fastify errors
  if ('statusCode' in error && !(error instanceof AuthError) && !(error instanceof HttpError)) {
    statusCode = error.statusCode as number;
  }

  return reply.status(statusCode).send({
    code: errorCode,
    message,
    ...isProduction ? {} : { info: util.inspect(error) }
  });
};