import { FastifyRequest } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';
import { EErrorCodes } from 'src/api/errors/EErrorCodes';

export const adminOnly = async function (request: FastifyRequest) {
  if (request.userRole !== 'admin') {
    throw new HttpError({
      statusCode: 403,
      message: 'Permission denied',
      errorCode: EErrorCodes.UNAUTHORIZED
    });
  }
};