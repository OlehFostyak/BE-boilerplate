import { FastifyRequest } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';

export const adminOnly = async function (request: FastifyRequest) {
  if (request.userRole !== 'admin') {
    throw new HttpError(403, 'Permission denied');
  }
};